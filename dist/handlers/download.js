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
const downloadHandler = (req, res, apiCall) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.session.user;
    const { file, folder } = req.query;
    try {
        const data = yield apiCall.downloadFile(user.id, file, `${folder}`);
        res.status(200);
        res.send(data);
        return;
    }
    catch (error) {
        if (error)
            res.status(500);
        res.send({
            message: "Unexpected error. Make sure the file exists and try again",
        });
        return;
    }
});
module.exports = downloadHandler;
// export default downloadHandler;
