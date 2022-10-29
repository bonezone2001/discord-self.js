import axios, { AxiosRequestConfig } from 'axios';
import { Constants } from './constants';
import { Utils } from './utils';

/*
    Identifies a discord user by their auth token.
    Also store the cloudflare and other cookies to prevent instant account restrictions.
    Make sure to call init() if passing into Discord class.
*/
export class User {
    private _token: string;
    private _cookies: string;

    constructor(token: string) {
        this._token = token;
        this._cookies = "";
    }

    async init() {
        if (!this._cookies) this._cookies = await User.getUserCookies();
    }

    // Primarily used for getting the cloudflare cookies
    static async getUserCookies() {
        const res = await axios({
            url: "https://discord.com/channels/@me",
            method: "GET",
            headers: Constants.defaultHeaders,
            decompress: true
        });

        const cookie = res.headers['set-cookie'];
        if (!cookie) throw new Error("Failed to get Discord cookies");
        return cookie.map((val) => val.split(';')[0]).join('; ');
    }

    async sendAsUser(options: AxiosRequestConfig) {
        const headers = this.userHeaders(options.headers);
        delete options.headers;
        return await axios({
            headers,
            decompress: true,
            timeout: 10e3,
            method: "GET",
            ...options,
        });
    }

    userHeaders(customHeaders = {}) {
        customHeaders = customHeaders || {};
        if (!this._cookies) throw new Error("User missing cookies, did you call init()?");
        return Object.assign({}, Constants.defaultHeaders, {
            'x-super-properties': Utils.base64Encode(Constants.tokenXSuper),
            'authorization': this._token,
            'cookie': this._cookies
        }, customHeaders);
    }

    get token() {
        return this._token;
    }

    get cookies() {
        return this._cookies;
    }
}