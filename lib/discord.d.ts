/// <reference types="node" />
/// <reference types="node" />
import { Channel, CountryCode, DiscordUserProfile, Emoji, Guild, GuildJoinInfo, Message, PaymentSource, Role, SessionInfo, Subscription } from "./types/discord";
import { GetMessageOptions, ParseEmojiResponseType, PresenceStatus, PresenceType, SendMessageReplyOptions } from "./types/discord-user";
import { EventEmitter } from 'events';
import { User } from "./user";
/**
 * Login and control a Discord user given their auth token.
 * Make sure to call init() before using any other methods.
 */
export declare class Discord extends EventEmitter {
    private _user;
    private _ws?;
    private _sessionInfo?;
    private _heartbeat?;
    constructor(userOrToken: User | string);
    init(): Promise<this>;
    getMessages(data: string | GetMessageOptions): Promise<Message[]>;
    getAllMessages(channelId: string): Promise<Message[]>;
    sendMessage(channelId: string, content: string, files?: string[] | Buffer[]): Promise<Message>;
    sendMessageReply(data: SendMessageReplyOptions): Promise<Message>;
    updateMessage(channelId: string, messageId: string, content: string): Promise<Message>;
    deleteMessage(channelId: string, messageId: string): Promise<void>;
    bulkDeleteMessages(channelId: string, messageIds: string[]): Promise<void>;
    addReaction(channelId: string, messageId: string, emoji: string): Promise<void>;
    removeReaction(channelId: string, messageId: string, emoji: string): Promise<void>;
    joinGuild(inviteCode: string): Promise<GuildJoinInfo>;
    leaveGuild(guildId: string): Promise<void>;
    getGuild(guildId: string): Promise<Guild>;
    getGuilds(): Promise<Guild[]>;
    getCustomEmojis(name?: string): Promise<Emoji[]>;
    getGuildCustomEmojis(guildId: string, name?: string): Promise<Emoji[]>;
    parseCustomEmojis(content: string, resType?: ParseEmojiResponseType): Promise<string | Emoji>;
    tryParseCustomEmojis(content: string, resType?: ParseEmojiResponseType): Promise<string | Emoji>;
    getChannel(channelId: string): Promise<Channel>;
    getGuildChannel(guildId: string, channelId: string): Promise<Channel>;
    getGuildChannels(guildId: string): Promise<Channel[]>;
    getDMChannel(userId: string): Promise<Channel>;
    getDMChannels(): Promise<Channel[]>;
    getGuildRoles(guildId: string): Promise<Role[]>;
    getGuildRole(guildId: string, roleId: string): Promise<Role>;
    createGuildRole(guildId: string, role: Role): Promise<Role>;
    editGuildRole(guildId: string, roleId: string, role: Role): Promise<Role>;
    deleteGuildRole(guildId: string, roleId: string): Promise<any>;
    getProfile(userId?: string): Promise<DiscordUserProfile>;
    getPaymentSources(): Promise<PaymentSource[]>;
    getPayments(): Promise<any>;
    getCountryCode(): Promise<CountryCode>;
    getSubscriptions(): Promise<Subscription[]>;
    isPremium(): Promise<boolean>;
    getSlashCommands(channelId: string, filter?: string, start?: string, limit?: number): Promise<any>;
    sendSlashCommand(channelId: string, cmd: string, options: any): Promise<import("axios").AxiosResponse<any, any>>;
    sendTyping(channelId: string): Promise<void>;
    startPresence(name: string, type: PresenceType, status: PresenceStatus): Promise<void>;
    setCustomStatus(text: string, status: PresenceStatus, emoji?: string | Emoji): Promise<void>;
    sendOp(op: number, data: any): Promise<void>;
    login(): Promise<any>;
    logout(): Promise<void>;
    get user(): User;
    get sessionInfo(): SessionInfo;
    get ws(): WebSocket;
    get ready(): boolean;
    get userTag(): string;
}
