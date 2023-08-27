import { Request, Response } from "express";
const hash = require("pbkdf2-password")({ digest: "sha256" });

const loginHandler = async (req: Request, res: Response, database: any) => {
  const email: string | null = req.body.email;
  const password: string | null = req.body.password;

  // Check user credential
  if (!email || !password) {
    res.status(400).json({ message: "Missing credentials" });
    return;
  }

  // get user from db
  const user: any | null = await database.getUser(email);
  if (!user) {
    res.status(401).send({
      message: "Wrong email or password",
    });
    return;
  }

  // Check that the password is correct
  hash(
    { password, salt: user.salt },
    (err: any, pass: any, salt: any, hash: any) => {
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
    }
  );
};

export default loginHandler;
