import { AxiosRequestConfig } from 'axios';
export declare class User {
    private _token;
    private _cookies;
    constructor(token: string);
    init(): Promise<void>;
    static getUserCookies(): Promise<string>;
    sendAsUser(options: AxiosRequestConfig): Promise<import("axios").AxiosResponse<any, any>>;
    userHeaders(customHeaders?: {}): {
        'User-Agent': string;
        'x-debug-options': string;
        'Accept-Encoding': string;
        Connection: string;
    } & {
        'x-super-properties': string;
        authorization: string;
        cookie: string;
    };
    get token(): string;
    get cookies(): string;
}
