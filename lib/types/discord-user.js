"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceStatus = exports.PresenceType = exports.ParseEmojiResponseType = void 0;
var ParseEmojiResponseType;
(function (ParseEmojiResponseType) {
    ParseEmojiResponseType[ParseEmojiResponseType["Raw"] = 0] = "Raw";
    ParseEmojiResponseType[ParseEmojiResponseType["Message"] = 1] = "Message";
    ParseEmojiResponseType[ParseEmojiResponseType["EmojiObj"] = 2] = "EmojiObj";
})(ParseEmojiResponseType = exports.ParseEmojiResponseType || (exports.ParseEmojiResponseType = {}));
var PresenceType;
(function (PresenceType) {
    PresenceType[PresenceType["PLAYING"] = 0] = "PLAYING";
    PresenceType[PresenceType["STREAMING"] = 1] = "STREAMING";
    PresenceType[PresenceType["LISTENING"] = 2] = "LISTENING";
    PresenceType[PresenceType["WATCHING"] = 3] = "WATCHING";
    PresenceType[PresenceType["CUSTOM"] = 4] = "CUSTOM";
    PresenceType[PresenceType["COMPETING"] = 5] = "COMPETING";
})(PresenceType = exports.PresenceType || (exports.PresenceType = {}));
var PresenceStatus;
(function (PresenceStatus) {
    PresenceStatus["ONLINE"] = "online";
    PresenceStatus["DND"] = "dnd";
    PresenceStatus["IDLE"] = "idle";
    PresenceStatus["INVISIBLE"] = "invisible";
    PresenceStatus["OFFLINE"] = "offline";
})(PresenceStatus = exports.PresenceStatus || (exports.PresenceStatus = {}));
