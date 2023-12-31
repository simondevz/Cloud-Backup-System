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
Object.defineProperty(exports, "__esModule", { value: true });
const newfolderHandler = (req, res, database, apiCall) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.session.user;
    const req_path = req.body.path;
    if (!req_path) {
        res.status(400);
        res.send({ message: "No folder path specified" });
        return;
    }
    try {
        yield apiCall.createFolder(user.id, req_path);
        yield database.savePath(req_path, user.id);
        res.status(201);
        res.send({ message: `${req_path} created` });
        return;
    }
    catch (error) {
        // Try cheching for the reason for your failure. already exists? check drop box docs
        res.sendStatus(500);
        return;
    }
});
module.exports = newfolderHandler;
// export default newfolderHandler;
