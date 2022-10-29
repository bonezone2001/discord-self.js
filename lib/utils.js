"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const fs_1 = require("fs");
const form_data_1 = __importDefault(require("form-data"));
class Utils {
    static async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    static base64Encode(data) {
        if (typeof data === "object")
            data = JSON.stringify(data);
        return Buffer.from(data).toString('base64');
    }
    static createMessageForm(data, files = []) {
        const form = new form_data_1.default();
        form.append('payload_json', JSON.stringify(data), { contentType: 'application/json' });
        for (const file of files)
            if (typeof file === "string")
                form.append('file', (0, fs_1.createReadStream)(file));
            else
                form.append('file', file);
        return form;
    }
    static arrayResponseAssert(data, message) {
        if (!data || !Array.isArray(data))
            throw new Error(data.code ? `${message}: ${data.code} ${data.message}` : message);
        return data;
    }
    static hasErrorAssert(data, message) {
        if (data.code)
            throw new Error(`${message}: ${data.code} ${data.message}`);
        return data;
    }
    static missingIdAssert(data, message) {
        if (!data.id)
            throw new Error(data.code ? `${message}: ${data.code} ${data.message}` : message);
        return data;
    }
    static missingPropertyAssert(data, property, message) {
        if (!data[property])
            throw new Error(data.code ? `${message}: ${data.code} ${data.message}` : message);
        return data;
    }
    static jsonFormat(data) {
        return JSON.stringify(data, null, 4);
    }
    static parseDiscordEmoji(emoji) {
        if (emoji.id)
            return `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
        return `https://twemoji.maxcdn.com/v/latest/72x72/${emoji.name.codePointAt(0).toString(16)}.png`;
    }
    static isEmojiObj(object) {
        return 'id' in object;
    }
}
exports.Utils = Utils;
