"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
/*
    Identifies a discord user by their auth token.
    Also store the cloudflare and other cookies to prevent instant account restrictions.
    Make sure to call init() if passing into Discord class.
*/
class User {
    _token;
    _cookies;
    constructor(token) {
        this._token = token;
        this._cookies = "";
    }
    async init() {
        if (!this._cookies)
            this._cookies = await User.getUserCookies();
    }
    // Primarily used for getting the cloudflare cookies
    static async getUserCookies() {
        const res = await (0, axios_1.default)({
            url: "https://discord.com/channels/@me",
            method: "GET",
            headers: constants_1.Constants.defaultHeaders,
            decompress: true
        });
        const cookie = res.headers['set-cookie'];
        if (!cookie)
            throw new Error("Failed to get Discord cookies");
        return cookie.map((val) => val.split(';')[0]).join('; ');
    }
    async sendAsUser(options) {
        const headers = this.userHeaders(options.headers);
        delete options.headers;
        return await (0, axios_1.default)({
            headers,
            decompress: true,
            timeout: 10e3,
            method: "GET",
            ...options,
        });
    }
    userHeaders(customHeaders = {}) {
        customHeaders = customHeaders || {};
        if (!this._cookies)
            throw new Error("User missing cookies, did you call init()?");
        return Object.assign({}, constants_1.Constants.defaultHeaders, {
            'x-super-properties': utils_1.Utils.base64Encode(constants_1.Constants.tokenXSuper),
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
exports.User = User;
