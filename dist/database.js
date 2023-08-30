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
require("dotenv").config();
const pgp = require("pg-promise")();
const username = process.env.PG_USERNAME;
const password = process.env.PG_PASSWORD;
const host = process.env.PG_HOST;
const port = process.env.PG_PORT;
const pg_database = process.env.PG_DB;
const db = pgp(`postgres://${username}:${password}@${host}:${port}/${pg_database}`);
const database = {
    getUser: (email) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield db.oneOrNone("SELECT * FROM users WHERE email=$1", [
            email,
        ]);
        return user;
    }),
    createUser: (user) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = yield db.one("INSERT INTO users(email, lastname, firstname, salt, hash) VALUES($1, $2, $3, $4, $5) RETURNING id", [user.email, user.lastname, user.firstname, user.salt, user.hash]);
        return id;
    }),
    savePath: (path, id) => __awaiter(void 0, void 0, void 0, function* () {
        yield db.none("INSERT INTO folders(folder_path, user_id) VALUES($1, $2)", [
            path,
            id,
        ]);
    }),
};
exports.default = database;
