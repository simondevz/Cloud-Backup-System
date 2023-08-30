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
const formidable_1 = __importDefault(require("formidable"));
const fs_1 = __importDefault(require("fs"));
const uploadHandler = (req, res, apiCall) => {
    const form = (0, formidable_1.default)({});
    const user = req.session.user;
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.sendStatus(500);
            return;
        }
        const fileSize = files.data[0].size;
        const path = fields === null || fields === void 0 ? void 0 : fields.path[0];
        if (fileSize > 200 * 1024 * 1024) {
            res.status(403).send({ message: "file too large" });
            return;
        }
        fs_1.default.readFile(files.data[0].filepath, (err, file) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            if (err) {
                res.sendStatus(500);
                return;
            }
            // Handle when files are less than 150mb
            if (fileSize < 150 * 1024 * 1024) {
                try {
                    const data = yield apiCall.uploadFile(user.id, file, path);
                    res.status(200).send({ data });
                    return;
                }
                catch (error) {
                    // if error.code=== 'ERR_INVALID_CHAR' then try renaming your file
                    if ((error === null || error === void 0 ? void 0 : error.code) === "ERR_INVALID_CHAR") {
                        res
                            .status(409)
                            .send({ message: "ERR_INVALID_CHAR, try renaming your file" });
                        return;
                    }
                    res.sendStatus(500);
                    return;
                }
            }
            //Handle when files are more than 150mb
            const startData = yield apiCall.uploadFileStart(file);
            const { session_id } = startData;
            try {
                yield apiCall.uploadFileAppend(file, session_id, 0);
            }
            catch (error) {
                const offset = (_c = (_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.correct_offset;
                if (offset) {
                    yield apiCall.uploadFileAppend(file, session_id, offset);
                }
                else {
                    res.sendStatus(500);
                    return;
                }
            }
            try {
                const finishData = yield apiCall.uploadFileFinish(user.id, file, session_id, 0, path);
                res.status(200).send({ data: finishData });
                return;
            }
            catch (error) {
                // if error.code=== 'ERR_INVALID_CHAR' then try renaming your file
                if ((error === null || error === void 0 ? void 0 : error.code) === "ERR_INVALID_CHAR") {
                    res
                        .status(409)
                        .send({ message: "ERR_INVALID_CHAR, try renaming your file" });
                    return;
                }
                const offset = (_g = (_f = (_e = (_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.error) === null || _f === void 0 ? void 0 : _f.lookup_failed) === null || _g === void 0 ? void 0 : _g.correct_offset;
                if (offset) {
                    const finishData = yield apiCall.uploadFileFinish(user.id, file, session_id, offset, path);
                    res.status(200).send({ data: finishData });
                    return;
                }
                else {
                    res.sendStatus(500);
                    return;
                }
            }
        }));
    });
};
module.exports = uploadHandler;
