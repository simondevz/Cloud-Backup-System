"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const body_parser_1 = __importDefault(require("body-parser"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const redis_1 = require("redis");
const signup_1 = __importDefault(require("./handlers/signup"));
const login_1 = __importDefault(require("./handlers/login"));
const uploadHandler = require("./handlers/upload");
const downloadHandler = require("./handlers/download");
const newfolderHandler = require("./handlers/newfolder");
require("dotenv").config();
function makeApp(database, apiCall) {
    const app = (0, express_1.default)();
    let redisClient = (0, redis_1.createClient)({ url: process.env.REDIS_URL });
    redisClient.connect().catch(console.error);
    let redisStore = new connect_redis_1.default({
        client: redisClient,
        prefix: "sess:",
    });
    app.use((0, express_session_1.default)({
        resave: false,
        saveUninitialized: false,
        secret: process.env.SECRET || "shhhh, very secret",
        cookie: { secure: false, sameSite: "none" },
        store: redisStore,
    }));
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "*");
        next();
    });
    app.use(body_parser_1.default.json());
    app.use(body_parser_1.default.urlencoded({ extended: false }));
    function isAuthenticated(req, res, next) {
        const user = req.session.user;
        if (!user && !req.session.authenticated) {
            res
                .status(401)
                .send({ message: "Please Log in at /login or sign up at /signup" });
            return;
        }
        next();
    }
    function addDownloadHeaders(req, res, next) {
        const { file } = req.query;
        if (!file) {
            res.status(400).send({ message: "no file specified" });
            return;
        }
        res.header("Content-Type", "application/octet-stream");
        res.header("Content-Disposition", `attachment; filename=${file}`);
        next();
    }
    app.get("/", (req, res) => {
        res.send({
            message: "Hi, there please login at /login or register at /signup",
        });
    });
    // Create folder
    app.post("/newfolder", isAuthenticated, (req, res) => {
        newfolderHandler(req, res, database, apiCall);
    });
    // Download files
    app.get("/download", [isAuthenticated, addDownloadHeaders], (req, res) => {
        downloadHandler(req, res, apiCall);
    });
    // upload files of max size 200mb
    app.post("/upload", isAuthenticated, (req, res) => {
        uploadHandler(req, res, apiCall);
    });
    app.post("/login", (req, res) => {
        (0, login_1.default)(req, res, database);
    });
    app.post("/signup", (req, res) => {
        (0, signup_1.default)(req, res, database, apiCall);
    });
    return app;
}
module.exports = makeApp;
