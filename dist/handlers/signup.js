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
const hash = require("pbkdf2-password")({ digest: "sha256" });
const signupHandler = (req, res, database, apiCall) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const emailRegEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    const email = ((_a = req.body) === null || _a === void 0 ? void 0 : _a.email) || "";
    const firstname = (_b = req.body) === null || _b === void 0 ? void 0 : _b.firstname;
    const lastname = (_c = req.body) === null || _c === void 0 ? void 0 : _c.lastname;
    const password = (_d = req.body) === null || _d === void 0 ? void 0 : _d.password;
    // Check user credential
    if (!(email && firstname && lastname && password && emailRegEx.test(email))) {
        res.status(400).send({ message: "Missing or Invalid credentials" });
        return;
    }
    // Check that email does not already exist in db
    const user = yield database.getUser(email);
    if (user) {
        res.status(403).send({
            message: "Email already in use. Try to log in or use a diffrent email address to register.",
        });
        return;
    }
    // Hash password
    hash({ password }, (err, pass, salt, hash) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.sendStatus(500);
            return;
        }
        const newUser = {
            email,
            firstname,
            lastname,
            salt: String(salt),
            hash: String(hash),
        };
        // Pass new user to db & update session
        const userId = yield database.createUser(newUser);
        req.session.authenticated = true;
        req.session.user = { id: userId, firstname, lastname, email };
        // Create folder for user in the cloud😁😅 (my dropbox account)
        // TODO: handle the possibility of not reaching here or make axios fetch a new token and try the post request again if it does not work delete the users account
        yield apiCall.createFolder(userId, null);
        res.status(201).send({ message: "Account Successfully Created" });
    }));
});
exports.default = signupHandler;
