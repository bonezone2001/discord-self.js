export interface GetMessageOptions {
    channelId: string;
    limit?: number;
    before?: string;
    after?: string;
    around?: string;
}

export interface SendMessageReplyOptions {
    channelId: string;
    guildId: string;
    messageId: string;
    content: string;
}

export interface SetGuildInfoOptions {
    name?: string;
    region?: string;
    icon?: string;
    verificationLevel?: number;
    defaultMessageNotifications?: number;
    explicitContentFilter?: number;
    afkChannelId?: string;
    afkTimeout?: number;
    systemChannelId?: string;
}

export enum ParseEmojiResponseType {
    Raw = 0,
    Message = 1,
    EmojiObj = 2
}

export enum PresenceType {
    PLAYING = 0,
    STREAMING = 1,
    LISTENING = 2,
    WATCHING = 3,
    CUSTOM = 4,
    COMPETING = 5
}

export enum PresenceStatus {
    ONLINE = "online",
    DND = "dnd",
    IDLE = "idle",
    INVISIBLE = "invisible",
    OFFLINE = "offline"
}