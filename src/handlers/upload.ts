import formidable from "formidable";
import { Request, Response } from "express";
import fs from "fs";
import { apiCallType } from "../apiCalls";

const uploadHandler = (req: Request, res: Response, apiCall: apiCallType) => {
  const form = formidable({});
  const user = req.session.user;

  console.log(form);

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.sendStatus(500);
      return;
    }

    const fileSize = files.data[0].size;
    const path = fields?.path?.[0] || null;
    const filename = files?.data[0]?.originalFilename;

    if (!filename) {
      res.status(400).send({ message: "no files sent" });
    }

    if (fileSize > 200 * 1024 * 1024) {
      res.status(403).send({ message: "file too large" });
      return;
    }

    fs.readFile(files.data[0].filepath, async (err, file) => {
      if (err) {
        res.sendStatus(500);
        return;
      }

      // Handle when files are less than 150mb
      if (fileSize < 150 * 1024 * 1024) {
        try {
          const data = await apiCall.uploadFile(user.id, file, filename, path);
          res.status(200).send({ data });
          return;
        } catch (error: any) {
          // if error.code=== 'ERR_INVALID_CHAR' then try renaming your file
          if (error?.code === "ERR_INVALID_CHAR") {
            res
              .status(409)
              .send({ message: "ERR_INVALID_CHAR, try renaming your file" });
            return;
          }

          res.sendStatus(500);
          return;
        }
      }

      //Handle when files are more than 150mb
      const startData = await apiCall.uploadFileStart(file);
      const { session_id } = startData;

      try {
        await apiCall.uploadFileAppend(file, session_id, 0);
      } catch (error: any) {
        const offset = error?.response?.data?.error?.correct_offset;

        if (offset) {
          await apiCall.uploadFileAppend(file, session_id, offset);
        } else {
          res.sendStatus(500);
          return;
        }
      }

      try {
        const finishData = await apiCall.uploadFileFinish(
          user.id,
          file,
          session_id,
          0,
          path
        );

        res.status(200).send({ data: finishData });
        return;
      } catch (error: any) {
        // if error.code=== 'ERR_INVALID_CHAR' then try renaming your file
        if (error?.code === "ERR_INVALID_CHAR") {
          res
            .status(409)
            .send({ message: "ERR_INVALID_CHAR, try renaming your file" });
          return;
        }

        const offset =
          error?.response?.data?.error?.lookup_failed?.correct_offset;

        if (offset) {
          const finishData = await apiCall.uploadFileFinish(
            user.id,
            file,
            session_id,
            offset,
            path
          );

          res.status(200).send({ data: finishData });
          return;
        } else {
          res.sendStatus(500);
          return;
        }
      }
    });
  });
};

module.exports = uploadHandler;
