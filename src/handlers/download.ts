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
    res.status(200);
    res.send(data);
    return;
  } catch (error) {
    if (error) res.status(500);
    res.send({
      message: "Unexpected error. Make sure the file exists and try again",
    });

    return;
  }
};

module.exports = downloadHandler;
// export default downloadHandler;
