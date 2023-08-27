import { Request, Response } from "express";
import { apiCallType } from "../apiCalls";

const downloadHandler = async (
  req: Request,
  res: Response,
  apiCall: apiCallType
) => {
  const user = req.session.user;
  const { file, folder } = req.query;

  try {
    const data = await apiCall.downloadFile(user.id, file, `${folder}`);
    res.status(200).send(data);
    return;
  } catch (error) {
    if (error)
      res.status(500).send({
        message: "Unexpected error. Make sure the file exists and try again",
      });

    return;
  }
};

export function addDownloadHeaders(req: Request, res: Response, next: any) {
  const { file } = req.query;
  if (!file) {
    res.status(400).send({ message: "no file specified" });
    return;
  }

  res.header("Content-Type", "application/octet-stream");
  res.header("Content-Disposition", `attachment; filename=${file}`);
  next();
}

export default downloadHandler;
