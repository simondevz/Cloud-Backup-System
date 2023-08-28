import { Request, Response } from "express";
import { apiCallType } from "../apiCalls";
const hash = require("pbkdf2-password")({ digest: "sha256" });

const signupHandler = async (
  req: Request,
  res: Response,
  database: any,
  apiCall: apiCallType
) => {
  const emailRegEx =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

  const email: string = req.body?.email || "";
  const firstname: string | null = req.body?.firstname;
  const lastname: string | null = req.body?.lastname;
  const password: string | null = req.body?.password;

  // Check user credential
  if (!(email && firstname && lastname && password && emailRegEx.test(email))) {
    res.status(400).send({ message: "Missing or Invalid credentials" });
    return;
  }

  // Check that email does not already exist in db
  const user: any | null = await database.getUser(email);
  if (user) {
    res.status(403).send({
      message:
        "Email already in use. Try to log in or use a diffrent email address to register.",
    });
    return;
  }

  // Hash password
  hash({ password }, async (err: any, pass: any, salt: any, hash: any) => {
    if (err) {
      res.sendStatus(500);
      return;
    }

    const newUser: typeof user = {
      email,
      firstname,
      lastname,
      salt: String(salt),
      hash: String(hash),
    };

    // Pass new user to db & update session
    const userId = await database.createUser(newUser);
    req.session.authenticated = true;
    req.session.user = { id: userId, firstname, lastname, email };

    // Create folder for user in the cloud😁😅 (my dropbox account)
    // TODO: handle the possibility of not reaching here or make axios fetch a new token and try the post request again if it does not work delete the users account
    await apiCall.createFolder(userId, null);
    res.status(201).send({ message: "Account Successfully Created" });
  });
};

export default signupHandler;
