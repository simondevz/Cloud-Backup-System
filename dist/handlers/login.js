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
const loginHandler = (req, res, database) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    // Check user credential
    if (!email || !password) {
        res.status(400).json({ message: "Missing credentials" });
        return;
    }
    // get user from db
    const user = yield database.getUser(email);
    if (!user) {
        res.status(401).send({
            message: "Wrong email or password",
        });
        return;
    }
    // Check that the password is correct
    hash({ password, salt: user.salt }, (err, pass, salt, hash) => {
        if (err) {
            res.sendStatus(500);
            return;
        }
        if (String(hash) !== user.hash) {
            res.status(401).send({
                message: "Wrong email or password",
            });
            return;
        }
        // Update session
        req.session.authenticated = true;
        req.session.user = {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
        };
        res
            .status(200)
            .send({ message: `Welcome back ${user.firstname} ${user.lastname}` });
    });
});
exports.default = loginHandler;
