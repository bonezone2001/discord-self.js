import { Constants } from './constants';
import { Emoji } from './types/discord';
import { createReadStream } from 'fs';
import FormData from 'form-data';
import { User } from './user';
import axios from 'axios';

export class Utils {
    static async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    static base64Encode(data: any) {
        if (typeof data === "object") data = JSON.stringify(data);
        return Buffer.from(data).toString('base64');
    }

    static createMessageForm(data: any, files: string[] | Buffer[] = []) {
        const form = new FormData();
        form.append('payload_json', JSON.stringify(data), { contentType: 'application/json' });

        for (const file of files)
            if (typeof file === "string") form.append('file', createReadStream(file));
            else form.append('file', file);
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

    static parseDiscordEmoji(emoji) {
        if (emoji.id) return `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
        return `https://twemoji.maxcdn.com/v/latest/72x72/${emoji.name.codePointAt(0).toString(16)}.png`;
    }

    static isEmojiObj(object: any): object is Emoji {
        return 'id' in object;
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
}