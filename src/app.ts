import express, { Request, Response, Application } from "express";
import session from "express-session";
import bodyParser from "body-parser";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import assert from "assert";
import cors from "cors";

import downloadHandler, { addDownloadHeaders } from "./handlers/download";
import signupHandler from "./handlers/signup";
import uploadHandler from "./handlers/upload";
import loginHandler from "./handlers/login";
import newfolderHandler from "./handlers/newfolder";
import { databaseType } from "./database";
import apiCall from "./apiCalls";

require("dotenv").config();

declare module "express-session" {
  interface SessionData {
    authenticated: boolean;
    user: any;
  }
}

function makeApp(database: databaseType) {
  const access_token = process.env.DROPBOX_ACCESS_TOKEN;
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

  app.get("/", (req: Request, res: Response) => {
    res.send({ message: "hello world" }); // Should return user's folders & files if logged in
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
