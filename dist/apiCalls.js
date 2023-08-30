"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv = require("dotenv");
// make a get access token function
let access_token = process.env.DROPBOX_ACCESS_TOKEN;
const getNewToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield axios_1.default.post("https://api.dropboxapi.com/oauth2/token", {
        grant_type: "refresh_token",
        refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
        client_id: process.env.DROPBOX_ID,
        client_secret: process.env.DROPBOX_SECRET,
    }, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    access_token = data.access_token;
    dotenv.populate(process.env, { DROPBOX_ACCESS_TOKEN: data.access_token }, { override: true, debug: true });
});
const apiCall = {
    createFolder: (userId, path) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const data = {
                autorename: false,
                path: `/user_${userId}${path ? "/" + path : ""}`,
            };
            const headers = {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
            };
            const { status } = yield axios_1.default.post("https://api.dropboxapi.com/2/files/create_folder_v2", data, { headers });
            return status;
        }
        catch (error) {
            const message = (_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error_summary;
            if (message === "expired_access_token/") {
                yield getNewToken();
                yield apiCall.createFolder(userId, path);
                return;
            }
            throw error;
        }
    }),
    uploadFile: (userId, file, path) => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        try {
            let headers = {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/octet-stream",
                "Dropbox-API-Arg": JSON.stringify({
                    path: `/user_${userId}/${path ? path + "/" : ""}${file.originalFilename}`,
                    mode: { ".tag": "add" },
                    autorename: true,
                    mute: false,
                    property_groups: [],
                    strict_conflict: false,
                }),
            };
            const { data } = yield axios_1.default.post("https://content.dropboxapi.com/2/files/upload", file, { headers });
            return data;
        }
        catch (error) {
            const message = (_d = (_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error_summary;
            if (message === "expired_access_token/") {
                yield getNewToken();
                yield apiCall.uploadFile(userId, file, path);
                return;
            }
            throw error;
        }
    }),
    uploadFileStart: (file) => __awaiter(void 0, void 0, void 0, function* () {
        var _e, _f;
        try {
            const headers = {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/octet-stream",
                "Dropbox-API-Arg": '{"close":false,"session_type":{".tag":"sequential"}}',
            };
            const { data } = yield axios_1.default.post("https://content.dropboxapi.com/2/files/upload_session/start", file, { headers });
            return data;
        }
        catch (error) {
            const message = (_f = (_e = error === null || error === void 0 ? void 0 : error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.error_summary;
            if (message === "expired_access_token/") {
                yield getNewToken();
                yield apiCall.uploadFileStart(file);
                return;
            }
            throw error;
        }
    }),
    uploadFileAppend: (file, session_id, offset) => __awaiter(void 0, void 0, void 0, function* () {
        var _g, _h;
        try {
            const headers = {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/octet-stream",
                "Dropbox-API-Arg": JSON.stringify({
                    cursor: { session_id: session_id, offset: offset },
                    close: false,
                }),
            };
            yield axios_1.default.post("https://content.dropboxapi.com/2/files/upload_session/append_v2", file, { headers });
            return "done";
        }
        catch (error) {
            const message = (_h = (_g = error === null || error === void 0 ? void 0 : error.response) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.error_summary;
            if (message === "expired_access_token/") {
                yield getNewToken();
                yield apiCall.uploadFileAppend(file, session_id, offset);
                return;
            }
            throw error;
        }
    }),
    uploadFileFinish: (userId, file, session_id, offset, path) => __awaiter(void 0, void 0, void 0, function* () {
        var _j, _k;
        try {
            const headers = {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/octet-stream",
                "Dropbox-API-Arg": JSON.stringify({
                    cursor: { session_id: session_id, offset: offset },
                    commit: {
                        path: `/user_${userId}/${path ? path + "/" : ""}${file.originalFilename}`,
                        mode: { ".tag": "add" },
                        autorename: true,
                        mute: false,
                    },
                }),
            };
            const { data } = yield axios_1.default.post("https://content.dropboxapi.com/2/files/upload_session/finish", file, { headers });
            return data;
        }
        catch (error) {
            const message = (_k = (_j = error === null || error === void 0 ? void 0 : error.response) === null || _j === void 0 ? void 0 : _j.data) === null || _k === void 0 ? void 0 : _k.error_summary;
            if (message === "expired_access_token/") {
                yield getNewToken();
                yield apiCall.uploadFileFinish(userId, file, session_id, offset, path);
                return;
            }
            throw error;
        }
    }),
    downloadFile: (userId, file, path) => __awaiter(void 0, void 0, void 0, function* () {
        var _l, _m;
        try {
            const headers = {
                Authorization: `Bearer ${access_token}`,
                "Dropbox-API-Arg": JSON.stringify({
                    path: `/user_${userId}/${path ? path + "/" : ""}${file}`,
                }),
            };
            const { data } = yield axios_1.default.get("https://content.dropboxapi.com/2/files/download", { headers, responseType: "arraybuffer" });
            return data;
        }
        catch (error) {
            const message = (_m = (_l = error === null || error === void 0 ? void 0 : error.response) === null || _l === void 0 ? void 0 : _l.data) === null || _m === void 0 ? void 0 : _m.error_summary;
            if (message === "expired_access_token/") {
                yield getNewToken();
                yield apiCall.downloadFile(userId, file, path);
                return;
            }
            throw error;
        }
    }),
};
exports.default = apiCall;
