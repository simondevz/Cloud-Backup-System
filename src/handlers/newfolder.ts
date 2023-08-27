import { Request, Response } from "express";
import { apiCallType } from "../apiCalls";

const newfolderHandler = async (
  req: Request,
  res: Response,
  database: any,
  apiCall: apiCallType
) => {
  const user = req.session.user;
  const req_path = req.body.path;

  if (!req_path) {
    res.status(400).send({ message: "No folder path specified" });
    return;
  }

  try {
    const status = (await apiCall.createFolder(user.id, req_path)) || 0;

    // if successful store file path in db
    if (status > 199 && status < 300) {
      await database.savePath(req_path, user.id);
      res.status(201).send({ message: `${req_path} created` });
      return;
    }
  } catch (error) {
    // Try cheching for the reason for your failure. already exists? check drop box docs
    res.sendStatus(500);
    return;
  }
};

export default newfolderHandler;
