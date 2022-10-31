import { Channel, CountryCode, DiscordUserProfile, Emoji, Guild, GuildJoinInfo, GuildSummary, Message, PaymentSource, Role, SessionInfo, Subscription } from "./types/discord";
import { GetMessageOptions, ParseEmojiResponseType, PresenceStatus, PresenceType, SendMessageReplyOptions, SetGuildInfoOptions } from "./types/discord-user";
import { EventEmitter } from 'events';
import FormData from 'form-data';
import { Utils } from "./utils";
import { WebSocket } from 'ws';
import { User } from "./user";

/**
 * Login and control a Discord user given their auth token.
 * Make sure to call init() before using any other methods.
 */
export class Discord extends EventEmitter {
    private _user: User;
    private _ws?: WebSocket;
    private _sessionInfo?: SessionInfo;
    private _heartbeat?: NodeJS.Timeout;

    constructor(userOrToken: User | string) {
        super();
        this._user = userOrToken instanceof User ? userOrToken : new User(userOrToken);
        this._ws = null;
        this._sessionInfo = null;
        this._heartbeat = null;
    }

    async init() {
        await this._user.init();
        return this;
    }

    // MESSAGES

    async getMessages(data: string | GetMessageOptions): Promise<Message[]> {
        if (typeof data === "string") data = { channelId: data };
        const messages = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${data.channelId}/messages?limit=${data.limit || 100}${data.before ? `&before=${data.before}` : ""}${data.after ? `&after=${data.after}` : ""}${data.around ? `&around=${data.around}` : ""}`
        }))?.data;

        Utils.arrayResponseAssert(messages, "Failed to get messages");
        return messages;
    }

    async getAllMessages(channelId: string): Promise<Message[]> {
        let messages: any[] = [];
        let lastMessageId: string | null = null;

        while (true) {
            const newMessages = await this.getMessages({ channelId, limit: 100, before: lastMessageId });
            if (!newMessages.length) break;
            messages = messages.concat(newMessages);
            lastMessageId = newMessages[newMessages.length - 1].id;
            await Utils.sleep(50);
        }

        return messages;
    }

    async sendMessage(channelId: string, content: string, files: string[] | Buffer[] = []): Promise<Message> {
        const form = Utils.createMessageForm({ content: await this.tryParseCustomEmojis(content) }, files);
        const message = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/messages`,
            method: "POST",
            data: form,
            headers: form.getHeaders()
        }))?.data;

        Utils.missingIdAssert(message, "Failed to send message");
        return message;
    }

    async sendMessageReply(data: SendMessageReplyOptions): Promise<Message> {
        const form = Utils.createMessageForm({
            content: await this.tryParseCustomEmojis(data.content),
            message_reference: {
                message_id: data.messageId,
                channel_id: data.channelId,
                guild_id: data.guildId
            }
        });

        const message = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${data.channelId}/messages`,
            method: "POST",
            data: form,
            headers: form.getHeaders()
        }))?.data;

        Utils.missingIdAssert(message, "Failed to send message");
        return message;
    }

    async updateMessage(channelId: string, messageId: string, content: string): Promise<Message> {
        const message = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/messages/${messageId}`,
            method: "PATCH",
            data: { content: await this.tryParseCustomEmojis(content) }
        }))?.data;

        Utils.missingIdAssert(message, "Failed to update message");
        return message;
    }

    async deleteMessage(channelId: string, messageId: string) {
        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/messages/${messageId}`,
            method: "DELETE"
        });
    }

    // UNTESTED
    // Typical bot endpoint, not tested with user accounts
    async bulkDeleteMessages(channelId: string, messageIds: string[]) {
        if (messageIds.length > 100) throw new Error("Cannot delete more than 100 messages at once");
        if (messageIds.length === 1) return this.deleteMessage(channelId, messageIds[0]);

        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/messages/bulk-delete`,
            method: "POST",
            data: { messages: messageIds }
        });
    }

    async addReaction(channelId: string, messageId: string, emoji: string) {
        if (emoji.length === 1) emoji = encodeURIComponent(emoji);
        else emoji = await this.tryParseCustomEmojis(emoji, ParseEmojiResponseType.Raw) as string;

        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`,
            method: "PUT"
        });
    }

    async removeReaction(channelId: string, messageId: string, emoji: string) {
        if (emoji.length === 1) emoji = encodeURIComponent(emoji);
        else emoji = await this.tryParseCustomEmojis(emoji, ParseEmojiResponseType.Raw) as string;

        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`,
            method: "DELETE"
        });
    }

    // GUILD

    async joinGuild(inviteCode: string): Promise<GuildJoinInfo> {
        const info = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/invites/${inviteCode}`,
            method: "POST"
        }))?.data;

        Utils.missingPropertyAssert(info, "guild", "Failed to join guild");
        return info;
    }

    async leaveGuild(guildId: string) {
        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/users/@me/guilds/${guildId}`,
            method: "DELETE"
        });
    }

    async getGuild(guildId: string): Promise<Guild> {
        const guild = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}`
        }))?.data;

        Utils.missingIdAssert(guild, "Failed to get guild");
        return guild;
    }

    async getGuilds(): Promise<GuildSummary[]> {
        const guilds = (await this._user.sendAsUser({
            url: "https://discord.com/api/v9/users/@me/guilds"
        }))?.data;

        Utils.arrayResponseAssert(guilds, "Failed to get guilds");
        return guilds;
    }

    async createGuild(name: string): Promise<Guild> {
        const guild = (await this._user.sendAsUser({
            url: "https://discord.com/api/v9/guilds",
            method: "POST",
            data: { name }
        }))?.data;

        Utils.missingIdAssert(guild, "Failed to create guild");
        return guild;
    }

    async setGuildInfo(guildId: string, data: SetGuildInfoOptions): Promise<Guild> {
        const guild = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}`,
            method: "PATCH",
            data: {
                name: data.name,
                region: data.region,
                verification_level: data.verificationLevel,
                default_message_notifications: data.defaultMessageNotifications,
                explicit_content_filter: data.explicitContentFilter,
                afk_channel_id: data.afkChannelId,
                afk_timeout: data.afkTimeout,
                system_channel_id: data.systemChannelId,
                system_channel_flags: data.systemChannelFlags,
                icon: data.icon
            }
        }))?.data;

        Utils.missingIdAssert(guild, "Failed to set guild info");
        return guild;
    }
    
    async deleteGuild(guildId: string) {
        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}`,
            method: "DELETE"
        });
    }

    // EMOJI
    
    async createEmoji(guildId: string, name: string, image: Buffer, imageExt: string): Promise<Emoji> {
        const emoji = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/emojis`,
            method: "POST",
            data: {
                name,
                image: `data:image/${imageExt};base64,${image.toString("base64")}`
            }
        }))?.data;

        Utils.missingIdAssert(emoji, "Failed to create emoji");
        return emoji;
    }

    async deleteEmoji(guildId: string, emojiId: string) {
        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/emojis/${emojiId}`,
            method: "DELETE"
        });
    }

    async getCustomEmojis(name?: string): Promise<Emoji[]> {
        if (!this._sessionInfo) throw new Error("Session info not set");
        const emojis = this._sessionInfo.guilds.reduce((acc, guild) => acc.concat(guild.emojis), []);
        return name ? emojis.filter(emoji => emoji.name === name) : emojis;
    }

    async getGuildCustomEmojis(guildId: string, name?: string): Promise<Emoji[]> {
        const guild = await this.getGuild(guildId);
        const emojis = guild.emojis;
        return name ? emojis.filter(emoji => emoji.name === name) : emojis;
    }

    async parseCustomEmojis(content: string, resType: ParseEmojiResponseType = ParseEmojiResponseType.Message) {
        const emojis = await this.getCustomEmojis();
        const emojiRegex = /:(\w+):/g;

        let response: string | Emoji | null = content;
        let match: RegExpExecArray | null;
        while (match = emojiRegex.exec(content)) {
            const emoji = emojis.find(emoji => emoji.name === match[1]);
            if (!emoji) continue;
            if (resType === ParseEmojiResponseType.Raw) response = content.replaceAll(match[0], `${emoji.name}:${emoji.id}`);
            else if (resType === ParseEmojiResponseType.Message) response = content.replaceAll(match[0], `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`);
            else {
                response = {
                    name: emoji.name,
                    id: emoji.id,
                    animated: emoji.animated
                };
            }
        }
        return response;
    }

    async tryParseCustomEmojis(content: string, resType: ParseEmojiResponseType = ParseEmojiResponseType.Message) {
        try {
            return await this.parseCustomEmojis(content, resType);
        } catch (e) {
            return content;
        }
    }

    // CHANNEL

    async getChannel(channelId: string): Promise<Channel> {
        const channel = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}`
        }))?.data;

        Utils.missingIdAssert(channel, "Failed to get channel");
        return channel;
    }

    async getGuildChannel(guildId: string, channelId: string): Promise<Channel> {
        const channel = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/channels/${channelId}`
        }))?.data;

        Utils.missingIdAssert(channel, "Failed to get channel");
        return channel;
    }

    async getGuildChannels(guildId: string): Promise<Channel[]> {
        const channels = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/channels`
        }))?.data;

        Utils.arrayResponseAssert(channels, "Failed to get guild channels");
        return channels;
    }

    async getDMChannel(userId: string): Promise<Channel> {
        const channel = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/users/@me/channels`,
            method: "POST",
            data: {"recipients": [userId]},
        }))?.data;

        Utils.missingIdAssert(channel, "Failed to get DM channel");
        return channel;
    }

    async getDMChannels(): Promise<Channel[]> {
        const channels = (await this._user.sendAsUser({
            url: "https://discord.com/api/v9/users/@me/channels"
        }))?.data;

        Utils.arrayResponseAssert(channels, "Failed to get DM channels");
        return channels;
    }

    async createChannel(guildId: string, channel: Channel): Promise<Channel> {
        const newChannel = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/channels`,
            method: "POST",
            data: channel
        }))?.data;

        Utils.missingIdAssert(newChannel, "Failed to create channel");
        return newChannel;
    }

    async editChannel(channelId: string, channel: Channel): Promise<Channel> {
        const newChannel = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}`,
            method: "PATCH",
            data: channel
        }))?.data;

        Utils.missingIdAssert(newChannel, "Failed to edit channel");
        return newChannel;
    }

    async deleteChannel(channelId: string): Promise<void> {
        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}`,
            method: "DELETE"
        });
    }

    // ROLES

    async getGuildRoles(guildId: string): Promise<Role[]> {
        const roles = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/roles`
        }))?.data;

        Utils.arrayResponseAssert(roles, "Failed to get guild roles");
        return roles;
    }

    // UNTESTED
    async getGuildRole(guildId: string, roleId: string): Promise<Role> {
        const role = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/roles/${roleId}`
        }))?.data;

        Utils.missingIdAssert(role, "Failed to get guild role");
        return role;
    }

    // UNTESTED
    async createGuildRole(guildId: string, role: Role): Promise<Role> {
        const newRole = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/roles`,
            method: "POST",
            data: role
        }))?.data;

        Utils.missingIdAssert(newRole, "Failed to create guild role");
        return newRole;
    }

    // UNTESTED
    async editGuildRole(guildId: string, roleId: string, role: Role): Promise<Role> {
        const newRole = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/roles/${roleId}`,
            method: "PATCH",
            data: role
        }))?.data;

        Utils.missingIdAssert(newRole, "Failed to edit guild role");
        return newRole;
    }

    // UNTESTED
    async deleteGuildRole(guildId: string, roleId: string) {
        const response = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/roles/${roleId}`,
            method: "DELETE"
        }))?.data;
    }

    // PROFILE

    async getProfile(userId?: string): Promise<DiscordUserProfile> {
        const profile = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/users/${userId || this._sessionInfo.user.id}/profile`
        }))?.data;

        Utils.missingPropertyAssert(profile, "user", "Failed to get profile");
        return profile;
    }

    async getPaymentSources(): Promise<PaymentSource[]> {
        const sources = (await this._user.sendAsUser({
            url: "https://discord.com/api/v9/users/@me/billing/payment-sources"
        }))?.data;

        Utils.arrayResponseAssert(sources, "Failed to get payment sources");
        return sources;
    }

    // Cba getting the types for this
    async getPayments() {
        const payments = (await this._user.sendAsUser({
            url: "https://discord.com/api/v9/users/@me/billing/payments"
        }))?.data;

        Utils.arrayResponseAssert(payments, "Failed to get payments");
        return payments;
    }

    async getCountryCode(): Promise<CountryCode> {
        const countryCode = (await this._user.sendAsUser({
            url: "https://discord.com/api/v9/users/@me/billing/country-code"
        }))?.data;

        Utils.hasErrorAssert(countryCode, "Failed to get country code");
        return countryCode;
    }

    async getSubscriptions(): Promise<Subscription[]> {
        const subscriptions = (await this._user.sendAsUser({
            url: "https://discord.com/api/v9/users/@me/billing/subscriptions"
        }))?.data;

        Utils.arrayResponseAssert(subscriptions, "Failed to get subscriptions");
        return subscriptions;
    }

    async isPremium() {
        const subscriptions = await this.getSubscriptions();
        return subscriptions.some(subscription => subscription.type === 1);
    }

    // COMMANDS

    // TODO: Allow filter to be a function
    async getSlashCommands(channelId: string, filter?: string,  start?: string, limit?: number) {
        const commands = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/application-commands/search?type=1${start ? `&start=${start}` : ""}${limit ? `&limit=${limit}` : ""}&include_applications=true`
        }))?.data?.applications_commands;

        Utils.arrayResponseAssert(commands, "Failed to get slash commands");
        if (filter)return commands.filter(command => command.name.includes(filter));
        return commands;
    }

    async sendSlashCommand(channelId: string, cmd: string, options: any) {
        const commands = await this.getSlashCommands(channelId, cmd);
        if (!commands.length) throw new Error(`No commands found for ${cmd}`);
        
        if (commands.length > 1) console.log(`Multiple commands found for ${cmd}, using first one`);
        const command = commands[0];

        const form = new FormData();
        form.append('payload_json', JSON.stringify({
            "type": 2,
            "application_id": command.application_id,
            "guild_id": options.guild,
            "channel_id": options.channel,
            "session_id": this.sessionInfo.session_id,
            "data": {
                "version": command.version,
                "id": command.id,
                "name": command.name,
                "type": 1,
                "options": [],
                "application_command": command,
                "attachments": []
            }
        }), { contentType: 'application/json' });

        return await this._user.sendAsUser({
            url: `https://discord.com/api/v9/interactions`,
            method: "POST",
            data: form,
            headers: form.getHeaders(),
            timeout: 10e3
        });
    }

    // MISC

    async sendTyping(channelId: string) {
        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/typing`,
            method: "POST"
        });
    }

    // PRESENCE

    async startPresence(name: string, type: PresenceType, status: PresenceStatus) {
        this.sendOp(3, {
            since: null,
            status: status ?? "online",
            afk: false,
            activities: [{
                name,
                type,
            }]
        });
    }

    async setCustomStatus(text: string, status: PresenceStatus, emoji?: string | Emoji) {
        if (emoji) {
            if (typeof emoji === "string" && emoji.length > 1) emoji = await this.tryParseCustomEmojis(emoji, ParseEmojiResponseType.EmojiObj);
            if (Utils.isEmojiObj(emoji)) emoji = JSON.stringify(emoji);
        }

        this.sendOp(3, {
            since: null,
            status: status ?? "online",
            afk: false,
            activities: [{
                name: "Custom Status",
                type: 4,
                state: text,
                emoji
            }]
        });
    }
        

    // WEBSOCKET

    async sendOp(op: number, data: any) {
        if (!this._ws) throw new Error("No websocket connection");
        this._ws.send(JSON.stringify({ op, d: data }));
    }

    async login() {
        if (this._ws) await this.logout();
        this._ws = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json");

        let outcome: any = null;
        const errorTimeout = setTimeout(() => {
            this.logout();
            throw new Error("Failed to connect to Discord");
        }, 10e3);

        this._ws.on('error', err => {
            if (err.message.includes("502") || !this.ready) {
                this.logout();
                outcome = err;
                throw new Error(err);
            }
            console.log(err.message);
        });

        this._ws.on('message', async (raw: string) => {
            const data = JSON.parse(raw);
            const { t, op, d } = data;

            // Discord wants us to identify
            if (op === 10) {
                this._heartbeat = setInterval(() => {
                    this._ws.send(JSON.stringify({ op: 1, d: null }));
                }, d.heartbeat_interval);

                await this.sendOp(2, {
                    token: this._user.token,
                    capabilities: 125,
                    properties: {
                        $os: "Windows",
                        $browser: "disco",
                        $device: "disco"
                    }
                });
                return;
            }

            // Discord sends use everything we need
            if (t === "READY") {
                clearTimeout(errorTimeout);
                this._sessionInfo = d;
                outcome = true;
            }

            if (t) this.emit(t, data);
            this.emit("raw", data);
        });
        

        this._ws.on('close', () => {
            this.logout();
            outcome = false; 
        });

        while (outcome === null) await Utils.sleep(100);
        return outcome;
    }

    async logout() {
        if (this._heartbeat) clearInterval(this._heartbeat);
        this._heartbeat = null;
        this._sessionInfo = null;

        try {
            this._ws?.close();
            this._ws?.terminate();
        } catch (error) { }
    }

    // GETTERS

    get user() {
        return this._user;
    }

    get sessionInfo() {
        return this._sessionInfo;
    }

    get ws() {
        return this._ws;
    }

    get ready() {
        return this._sessionInfo !== null;
    }

    get userTag() {
        return `${this._sessionInfo.user.username}#${this._sessionInfo.user.discriminator}`;
    }
}