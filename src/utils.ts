import { Constants } from './constants';
import { Emoji } from './types/discord';
import FormData from 'form-data';
import { User } from './user';
import axios from 'axios';

// Taken from "discord-api-types" package
export const PermissionFlagsBits = {
	CREATE_INSTANT_INVITE: 1n << 0n,
	KICK_MEMBERS: 1n << 1n,
	BAN_MEMBERS: 1n << 2n,
	ADMINISTRATOR: 1n << 3n,
	MANAGE_CHANNELS: 1n << 4n,
	MANAGE_GUILD: 1n << 5n,
	ADD_REACTIONS: 1n << 6n,
	VIEW_AUDIT_LOG: 1n << 7n,
	PRIORITY_SPEAKER: 1n << 8n,
	STREAM: 1n << 9n,
	VIEW_CHANNEL: 1n << 10n,
	SEND_MESSAGES: 1n << 11n,
	SEND_TTS_MESSAGES: 1n << 12n,
	MANAGE_MESSAGES: 1n << 13n,
	EMBED_LINKS: 1n << 14n,
	ATTACH_FILES: 1n << 15n,
	READ_MESSAGE_HISTORY: 1n << 16n,
	MENTION_EVERYONE: 1n << 17n,
	USE_EXTERNAL_EMOJIS: 1n << 18n,
	VIEW_GUILD_INSIGHTS: 1n << 19n,
	CONNECT: 1n << 20n,
	SPEAK: 1n << 21n,
	MUTE_MEMBERS: 1n << 22n,
	DEAFEN_MEMBERS: 1n << 23n,
	MOVE_MEMBERS: 1n << 24n,
	USE_VAD: 1n << 25n,
	CHANGE_NICKNAME: 1n << 26n,
	MANAGE_NICKNAMES: 1n << 27n,
	MANAGE_ROLES: 1n << 28n,
	MANAGE_WEBHOOKS: 1n << 29n,
	MANAGE_EMOJIS: 1n << 30n,
	USE_SLASH_COMMANDS: 1n << 31n,
	REQUEST_TO_SPEAK: 1n << 32n,
} as const;
Object.freeze(PermissionFlagsBits);


export class Utils {
    static async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    static base64Encode(data: any) {
        if (typeof data === "object") data = JSON.stringify(data);
        else data = String(data);
        return Buffer.from(data).toString('base64');
    }

    static createMessageForm(data: any, files: ({ data: Buffer, filename: string })[] = []) {
        const form = new FormData();
        if (data) form.append('payload_json', JSON.stringify(data), { contentType: 'application/json' });

        for (const file of files)
            form.append('file', file.data, { filename: file.filename });
        return form;
    }

    static arrayResponseAssert(data: any, message: string) {
        if (!data || !Array.isArray(data)) throw new Error(data.code ? `${message}: ${data.code} ${data.message}` : message);
        return data;
    }

    static hasErrorAssert(data: any, message: string) {
        if (data.code) throw new Error(`${message}: ${data.code} ${data.message}`);
        return data;
    }

    static missingIdAssert(data: any, message: string) {
        if (!data.id) throw new Error(data.code ? `${message}: ${data.code} ${data.message}` : message);
        return data;
    }

    static missingPropertyAssert(data: any, property: string, message: string) {
        if (!data[property]) throw new Error(data.code ? `${message}: ${data.code} ${data.message}` : message);
        return data;
    }

    static jsonFormat(data: any) {
        return JSON.stringify(data, null, 4);
    }

    static emojiToUrl(emoji: Emoji) {
        if (emoji.id) return `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
        return `https://twemoji.maxcdn.com/v/latest/72x72/${emoji.name.codePointAt(0).toString(16)}.png`;
    }

    static isEmojiObj(object: any): object is Emoji {
        return 'id' in object && 'name' in object;
    }

    static async downloadFile(url: string, options: any = {}, user: User = null) {
        const headers = user ? user.userHeaders(options.headers) : Constants.defaultHeaders;
        delete options.headers;
        const res = await axios({
            url,
            method: "GET",
            headers,
            responseType: "arraybuffer",
            ...options,
        });
        return res.data;
    }

    // TODO: Improve this lameness
    static async waitIfRateLimited<T>(func: () => Promise<T>): Promise<T> {
        while (true) {
            try { return await func(); }
            catch (e) {
                if (e?.response?.data && e?.response?.data.retry_after) {
                    if (e.response.data.retry_after> 180)
                        throw new Error("Rate limit very high, aborting wait");
                    console.log(`Rate limited, waiting ${e.response.data.retry_after} seconds`);
                    await Utils.sleep(e.response.data.retry_after * 1000 + 100);
                    continue;
                }
                throw e;
            }
        }
    }

    // Check if has permission using discord bitfields
    static hasPermission(permissions: bigint, permission: bigint) {
        return (permissions & permission) === permission;
    }

    static hasPermissions(permissions: bigint, permissionsToCheck: bigint[]) {
        return permissionsToCheck.every((permission) => Utils.hasPermission(permissions, permission));
    }
}