"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Discord = void 0;
const discord_user_1 = require("./types/discord-user");
const events_1 = require("events");
const form_data_1 = __importDefault(require("form-data"));
const utils_1 = require("./utils");
const ws_1 = require("ws");
const user_1 = require("./user");
/**
 * Login and control a Discord user given their auth token.
 * Make sure to call init() before using any other methods.
 */
class Discord extends events_1.EventEmitter {
    _user;
    _ws;
    _sessionInfo;
    _heartbeat;
    constructor(userOrToken) {
        super();
        this._user = userOrToken instanceof user_1.User ? userOrToken : new user_1.User(userOrToken);
        this._ws = null;
        this._sessionInfo = null;
        this._heartbeat = null;
    }
    async init() {
        await this._user.init();
        return this;
    }
    // MESSAGES
    async getMessages(data) {
        if (typeof data === "string")
            data = { channelId: data };
        const messages = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${data.channelId}/messages?limit=${data.limit || 100}${data.before ? `&before=${data.before}` : ""}${data.after ? `&after=${data.after}` : ""}${data.around ? `&around=${data.around}` : ""}`
        }))?.data;
        utils_1.Utils.arrayResponseAssert(messages, "Failed to get messages");
        return messages;
    }
    async getAllMessages(channelId) {
        let messages = [];
        let lastMessageId = null;
        while (true) {
            const newMessages = await this.getMessages({ channelId, limit: 100, before: lastMessageId });
            if (!newMessages.length)
                break;
            messages = messages.concat(newMessages);
            lastMessageId = newMessages[newMessages.length - 1].id;
            await utils_1.Utils.sleep(50);
        }
        return messages;
    }
    async sendMessage(channelId, content, files = []) {
        const form = utils_1.Utils.createMessageForm({ content: await this.tryParseCustomEmojis(content) }, files);
        const message = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/messages`,
            method: "POST",
            data: form,
            headers: form.getHeaders()
        }))?.data;
        utils_1.Utils.missingIdAssert(message, "Failed to send message");
        return message;
    }
    async sendMessageReply(data) {
        const form = utils_1.Utils.createMessageForm({
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
        utils_1.Utils.missingIdAssert(message, "Failed to send message");
        return message;
    }
    async updateMessage(channelId, messageId, content) {
        const message = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/messages/${messageId}`,
            method: "PATCH",
            data: { content: await this.tryParseCustomEmojis(content) }
        }))?.data;
        utils_1.Utils.missingIdAssert(message, "Failed to update message");
        return message;
    }
    async deleteMessage(channelId, messageId) {
        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/messages/${messageId}`,
            method: "DELETE"
        });
    }
    // UNTESTED
    // Typical bot endpoint, not tested with user accounts
    async bulkDeleteMessages(channelId, messageIds) {
        if (messageIds.length > 100)
            throw new Error("Cannot delete more than 100 messages at once");
        if (messageIds.length === 1)
            return this.deleteMessage(channelId, messageIds[0]);
        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/messages/bulk-delete`,
            method: "POST",
            data: { messages: messageIds }
        });
    }
    async addReaction(channelId, messageId, emoji) {
        if (emoji.length === 1)
            emoji = encodeURIComponent(emoji);
        else
            emoji = await this.tryParseCustomEmojis(emoji, discord_user_1.ParseEmojiResponseType.Raw);
        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`,
            method: "PUT"
        });
    }
    async removeReaction(channelId, messageId, emoji) {
        if (emoji.length === 1)
            emoji = encodeURIComponent(emoji);
        else
            emoji = await this.tryParseCustomEmojis(emoji, discord_user_1.ParseEmojiResponseType.Raw);
        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`,
            method: "DELETE"
        });
    }
    // GUILD
    async joinGuild(inviteCode) {
        const info = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/invites/${inviteCode}`,
            method: "POST"
        }))?.data;
        utils_1.Utils.missingPropertyAssert(info, "guild", "Failed to join guild");
        return info;
    }
    async leaveGuild(guildId) {
        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/users/@me/guilds/${guildId}`,
            method: "DELETE"
        });
    }
    async getGuild(guildId) {
        const guild = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}`
        }))?.data;
        utils_1.Utils.missingIdAssert(guild, "Failed to get guild");
        return guild;
    }
    async getGuilds() {
        const guilds = (await this._user.sendAsUser({
            url: "https://discord.com/api/v9/users/@me/guilds"
        }))?.data;
        utils_1.Utils.arrayResponseAssert(guilds, "Failed to get guilds");
        return guilds;
    }
    async getCustomEmojis(name) {
        if (!this._sessionInfo)
            throw new Error("Session info not set");
        const emojis = this._sessionInfo.guilds.reduce((acc, guild) => acc.concat(guild.emojis), []);
        return name ? emojis.filter(emoji => emoji.name === name) : emojis;
    }
    async getGuildCustomEmojis(guildId, name) {
        const guild = await this.getGuild(guildId);
        const emojis = guild.emojis;
        return name ? emojis.filter(emoji => emoji.name === name) : emojis;
    }
    async parseCustomEmojis(content, resType = discord_user_1.ParseEmojiResponseType.Message) {
        const emojis = await this.getCustomEmojis();
        const emojiRegex = /:(\w+):/g;
        let response = null;
        let match;
        while (match = emojiRegex.exec(content)) {
            const emoji = emojis.find(emoji => emoji.name === match[1]);
            if (!emoji)
                continue;
            if (resType === discord_user_1.ParseEmojiResponseType.Raw)
                response = content.replaceAll(match[0], `${emoji.name}:${emoji.id}`);
            else if (resType === discord_user_1.ParseEmojiResponseType.Message)
                response = content.replaceAll(match[0], `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`);
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
    async tryParseCustomEmojis(content, resType = discord_user_1.ParseEmojiResponseType.Message) {
        try {
            return await this.parseCustomEmojis(content, resType);
        }
        catch (e) {
            return content;
        }
    }
    // CHANNEL
    async getChannel(channelId) {
        const channel = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}`
        }))?.data;
        utils_1.Utils.missingIdAssert(channel, "Failed to get channel");
        return channel;
    }
    async getGuildChannel(guildId, channelId) {
        const channel = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/channels/${channelId}`
        }))?.data;
        utils_1.Utils.missingIdAssert(channel, "Failed to get channel");
        return channel;
    }
    async getGuildChannels(guildId) {
        const channels = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/channels`
        }))?.data;
        utils_1.Utils.arrayResponseAssert(channels, "Failed to get guild channels");
        return channels;
    }
    async getDMChannel(userId) {
        const channel = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/users/@me/channels`,
            method: "POST",
            data: { "recipients": [userId] },
        }))?.data;
        utils_1.Utils.missingIdAssert(channel, "Failed to get DM channel");
        return channel;
    }
    async getDMChannels() {
        const channels = (await this._user.sendAsUser({
            url: "https://discord.com/api/v9/users/@me/channels"
        }))?.data;
        utils_1.Utils.arrayResponseAssert(channels, "Failed to get DM channels");
        return channels;
    }
    // ROLES
    // UNTESTED
    async getGuildRoles(guildId) {
        const roles = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/roles`
        }))?.data;
        utils_1.Utils.arrayResponseAssert(roles, "Failed to get guild roles");
        return roles;
    }
    // UNTESTED
    async getGuildRole(guildId, roleId) {
        const role = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/roles/${roleId}`
        }))?.data;
        utils_1.Utils.missingIdAssert(role, "Failed to get guild role");
        return role;
    }
    // UNTESTED
    async createGuildRole(guildId, role) {
        const newRole = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/roles`,
            method: "POST",
            data: role
        }))?.data;
        utils_1.Utils.missingIdAssert(newRole, "Failed to create guild role");
        return newRole;
    }
    // UNTESTED
    async editGuildRole(guildId, roleId, role) {
        const newRole = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/roles/${roleId}`,
            method: "PATCH",
            data: role
        }))?.data;
        utils_1.Utils.missingIdAssert(newRole, "Failed to edit guild role");
        return newRole;
    }
    // UNTESTED
    async deleteGuildRole(guildId, roleId) {
        const response = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/guilds/${guildId}/roles/${roleId}`,
            method: "DELETE"
        }))?.data;
        utils_1.Utils.missingIdAssert(response, "Failed to delete guild role");
        return response;
    }
    // PROFILE
    async getProfile(userId) {
        const profile = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/users/${userId || this._sessionInfo.user.id}/profile`
        }))?.data;
        utils_1.Utils.missingPropertyAssert(profile, "user", "Failed to get profile");
        return profile;
    }
    async getPaymentSources() {
        const sources = (await this._user.sendAsUser({
            url: "https://discord.com/api/v9/users/@me/billing/payment-sources"
        }))?.data;
        utils_1.Utils.arrayResponseAssert(sources, "Failed to get payment sources");
        return sources;
    }
    // Cba getting the types for this
    async getPayments() {
        const payments = (await this._user.sendAsUser({
            url: "https://discord.com/api/v9/users/@me/billing/payments"
        }))?.data;
        utils_1.Utils.arrayResponseAssert(payments, "Failed to get payments");
        return payments;
    }
    async getCountryCode() {
        const countryCode = (await this._user.sendAsUser({
            url: "https://discord.com/api/v9/users/@me/billing/country-code"
        }))?.data;
        utils_1.Utils.hasErrorAssert(countryCode, "Failed to get country code");
        return countryCode;
    }
    async getSubscriptions() {
        const subscriptions = (await this._user.sendAsUser({
            url: "https://discord.com/api/v9/users/@me/billing/subscriptions"
        }))?.data;
        utils_1.Utils.arrayResponseAssert(subscriptions, "Failed to get subscriptions");
        return subscriptions;
    }
    async isPremium() {
        const subscriptions = await this.getSubscriptions();
        return subscriptions.some(subscription => subscription.type === 1);
    }
    // COMMANDS
    // TODO: Allow filter to be a function
    async getSlashCommands(channelId, filter, start, limit) {
        const commands = (await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/application-commands/search?type=1${start ? `&start=${start}` : ""}${limit ? `&limit=${limit}` : ""}&include_applications=true`
        }))?.data?.applications_commands;
        utils_1.Utils.arrayResponseAssert(commands, "Failed to get slash commands");
        if (filter)
            return commands.filter(command => command.name.includes(filter));
        return commands;
    }
    async sendSlashCommand(channelId, cmd, options) {
        const commands = await this.getSlashCommands(channelId, cmd);
        if (!commands.length)
            throw new Error(`No commands found for ${cmd}`);
        if (commands.length > 1)
            console.log(`Multiple commands found for ${cmd}, using first one`);
        const command = commands[0];
        const form = new form_data_1.default();
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
    async sendTyping(channelId) {
        await this._user.sendAsUser({
            url: `https://discord.com/api/v9/channels/${channelId}/typing`,
            method: "POST"
        });
    }
    // PRESENCE
    async startPresence(name, type, status) {
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
    async setCustomStatus(text, status, emoji) {
        if (emoji) {
            if (typeof emoji === "string" && emoji.length > 1)
                emoji = await this.tryParseCustomEmojis(emoji, discord_user_1.ParseEmojiResponseType.EmojiObj);
            if (utils_1.Utils.isEmojiObj(emoji))
                emoji = JSON.stringify(emoji);
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
    async sendOp(op, data) {
        if (!this._ws)
            throw new Error("No websocket connection");
        this._ws.send(JSON.stringify({ op, d: data }));
    }
    async login() {
        if (this._ws)
            await this.logout();
        this._ws = new ws_1.WebSocket("wss://gateway.discord.gg/?v=9&encoding=json");
        let outcome = null;
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
        this._ws.on('message', async (raw) => {
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
            if (t)
                this.emit(t, data);
            this.emit("raw", data);
        });
        this._ws.on('close', () => {
            this.logout();
            outcome = false;
        });
        while (outcome === null)
            await utils_1.Utils.sleep(100);
        return outcome;
    }
    async logout() {
        if (this._heartbeat)
            clearInterval(this._heartbeat);
        this._heartbeat = null;
        this._sessionInfo = null;
        try {
            this._ws?.close();
            this._ws?.terminate();
        }
        catch (error) { }
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
exports.Discord = Discord;
