import express, { Request, Response, Application } from "express";
import session from "express-session";
import bodyParser from "body-parser";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import assert from "assert";
import cors from "cors";

import signupHandler from "./handlers/signup";
import loginHandler from "./handlers/login";
import { databaseType } from "./database";
import { apiCallType } from "./apiCalls";

const uploadHandler = require("./handlers/upload");
const downloadHandler = require("./handlers/download");
const newfolderHandler = require("./handlers/newfolder");
require("dotenv").config();

declare module "express-session" {
  interface SessionData {
    authenticated: boolean;
    user: any;
  }
}

function makeApp(database: databaseType, apiCall: apiCallType) {
  const app: Application = express();
  let redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.connect().catch(console.error);

  let redisStore = new RedisStore({
    client: redisClient,
    prefix: "sess:",
  });

  app.use(
    session({
      resave: false, // don't save session if unmodified
      saveUninitialized: false, // don't create session until something stored
      secret: process.env.SECRET || "shhhh, very secret",
      cookie: { secure: false, sameSite: "none" },
      store: redisStore,
    })
  );

  app.use((req: Request, res: Response, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  function isAuthenticated(req: Request, res: Response, next: any) {
    const user = req.session.user;
    if (!user && !req.session.authenticated) {
      res
        .status(401)
        .send({ message: "Please Log in at /login or sign up at /signup" });
      return;
    }
    next();
  }

  function addDownloadHeaders(req: Request, res: Response, next: any) {
    const { file } = req.query;
    if (!file) {
      res.status(400).send({ message: "no file specified" });
      return;
    }

    res.header("Content-Type", "application/octet-stream");
    res.header("Content-Disposition", `attachment; filename=${file}`);
    next();
  }

  app.get("/", (req: Request, res: Response) => {
    res.send({
      message: "Hi, there please login at /login or register at /signup",
    });
  });

  // Create folder
  app.post("/newfolder", isAuthenticated, (req: Request, res: Response) => {
    newfolderHandler(req, res, database, apiCall);
  });

  // Download files
  app.get(
    "/download",
    [isAuthenticated, addDownloadHeaders],
    (req: Request, res: Response) => {
      downloadHandler(req, res, apiCall);
    }
  );

  // upload files of max size 200mb
  app.post("/upload", isAuthenticated, (req: Request, res: Response) => {
    uploadHandler(req, res, apiCall);
  });

  app.post("/login", (req: Request, res: Response) => {
    loginHandler(req, res, database);
  });

  app.post("/signup", (req: Request, res: Response) => {
    signupHandler(req, res, database, apiCall);
  });

  return app;
}

module.exports = makeApp;
