/// <reference types="node" />
import { Emoji } from './types/discord';
import FormData from 'form-data';
export declare class Utils {
    static sleep(ms: number): Promise<unknown>;
    static base64Encode(data: any): string;
    static createMessageForm(data: any, files?: string[] | Buffer[]): FormData;
    static arrayResponseAssert(data: any, message: string): any[];
    static hasErrorAssert(data: any, message: string): any;
    static missingIdAssert(data: any, message: string): any;
    static missingPropertyAssert(data: any, property: string, message: string): any;
    static jsonFormat(data: any): string;
    static parseDiscordEmoji(emoji: any): string;
    static isEmojiObj(object: any): object is Emoji;
}
