import { Request, Response } from "express";
import { apiCallType } from "../apiCalls";
import { databaseType } from "../database";

const newfolderHandler = async (
  req: Request,
  res: Response,
  database: databaseType,
  apiCall: apiCallType
) => {
  const user = req.session.user;
  const req_path = req.body.path;

  if (!req_path) {
    res.status(400);
    res.send({ message: "No folder path specified" });
    return;
  }

  try {
    await apiCall.createFolder(user.id, req_path);
    await database.savePath(req_path, user.id);
    res.status(201);
    res.send({ message: `${req_path} created` });
    return;
  } catch (error) {
    // Try cheching for the reason for your failure. already exists? check drop box docs
    res.sendStatus(500);
    return;
  }
};

module.exports = newfolderHandler;
// export default newfolderHandler;
