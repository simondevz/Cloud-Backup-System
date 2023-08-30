import axios from "axios";
const dotenv = require("dotenv");

export interface apiCallType {
  uploadFile: (
    userId: string,
    file: any,
    filename: string | null,
    path: string | null
  ) => Promise<any>;
  uploadFileStart: (file: any) => Promise<any>;
  downloadFile: (userId: number, file: any, path: string) => Promise<any>;

  createFolder: (
    userId: number,
    path: string | null
  ) => Promise<number | undefined>;

  uploadFileAppend: (
    file: any,
    session_id: string,
    offset: number
  ) => Promise<any>;

  uploadFileFinish: (
    userId: number,
    file: any,
    session_id: string,
    offset: number,
    path: string | null
  ) => Promise<any>;
}

// make a get access token function
let access_token = process.env.DROPBOX_ACCESS_TOKEN;
const getNewToken = async () => {
  const { data } = await axios.post(
    "https://api.dropboxapi.com/oauth2/token",
    {
      grant_type: "refresh_token",
      refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
      client_id: process.env.DROPBOX_ID,
      client_secret: process.env.DROPBOX_SECRET,
    },
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  access_token = data.access_token;
  dotenv.populate(
    process.env,
    { DROPBOX_ACCESS_TOKEN: data.access_token },
    { override: true, debug: true }
  );
};

const apiCall = {
  createFolder: async (userId: number, path: string | null) => {
    try {
      const data = {
        autorename: false,
        path: `/user_${userId}${path ? "/" + path : ""}`,
      };
      const headers = {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      };

      const { status } = await axios.post(
        "https://api.dropboxapi.com/2/files/create_folder_v2",
        data,
        { headers }
      );
      return status;
    } catch (error: any) {
      const message = error?.response?.data?.error_summary;

      if (message.includes("expired_access_token")) {
        await getNewToken();
        await apiCall.createFolder(userId, path);
        return;
      }

      throw error;
    }
  },

  uploadFile: async (
    userId: string,
    file: any,
    filename: string,
    path: string | null
  ) => {
    try {
      let headers = {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path: `/user_${userId}/${path ? path + "/" : ""}${filename}`,
          mode: { ".tag": "add" },
          autorename: true,
          mute: false,
          property_groups: [],
          strict_conflict: false,
        }),
      };

      const { data } = await axios.post(
        "https://content.dropboxapi.com/2/files/upload",
        file,
        { headers }
      );
      return data;
    } catch (error: any) {
      const message = error?.response?.data?.error_summary;

      if (message.includes("expired_access_token")) {
        await getNewToken();
        await apiCall.uploadFile(userId, file, filename, path);
        return;
      }

      throw error;
    }
  },

  uploadFileStart: async (file: any) => {
    try {
      const headers = {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg":
          '{"close":false,"session_type":{".tag":"sequential"}}',
      };

      const { data } = await axios.post(
        "https://content.dropboxapi.com/2/files/upload_session/start",
        file,
        { headers }
      );
      return data;
    } catch (error: any) {
      const message = error?.response?.data?.error_summary;

      if (message.includes("expired_access_token")) {
        await getNewToken();
        await apiCall.uploadFileStart(file);
        return;
      }

      throw error;
    }
  },

  uploadFileAppend: async (file: any, session_id: string, offset: number) => {
    try {
      const headers = {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          cursor: { session_id: session_id, offset: offset },
          close: false,
        }),
      };

      await axios.post(
        "https://content.dropboxapi.com/2/files/upload_session/append_v2",
        file,
        { headers }
      );
      return "done";
    } catch (error: any) {
      const message = error?.response?.data?.error_summary;

      if (message.includes("expired_access_token")) {
        await getNewToken();
        await apiCall.uploadFileAppend(file, session_id, offset);
        return;
      }

      throw error;
    }
  },

  uploadFileFinish: async (
    userId: number,
    file: any,
    session_id: string,
    offset: number,
    path: string | null
  ) => {
    try {
      const headers = {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          cursor: { session_id: session_id, offset: offset },
          commit: {
            path: `/user_${userId}/${path ? path + "/" : ""}${
              file.originalFilename
            }`,
            mode: { ".tag": "add" },
            autorename: true,
            mute: false,
          },
        }),
      };

      const { data } = await axios.post(
        "https://content.dropboxapi.com/2/files/upload_session/finish",
        file,
        { headers }
      );
      return data;
    } catch (error: any) {
      const message = error?.response?.data?.error_summary;

      if (message.includes("expired_access_token")) {
        await getNewToken();
        await apiCall.uploadFileFinish(userId, file, session_id, offset, path);
        return;
      }

      throw error;
    }
  },

  downloadFile: async (userId: number, file: any, path: string) => {
    try {
      const headers = {
        Authorization: `Bearer ${access_token}`,
        "Dropbox-API-Arg": JSON.stringify({
          path: `/user_${userId}/${path ? path + "/" : ""}${file}`,
        }),
      };

      const { data } = await axios.get(
        "https://content.dropboxapi.com/2/files/download",
        { headers, responseType: "arraybuffer" }
      );
      return data;
    } catch (error: any) {
      const message = error?.response?.data?.error_summary;

      if (message.includes("expired_access_token")) {
        await getNewToken();
        await apiCall.downloadFile(userId, file, path);
        return;
      }

      throw error;
    }
  },
};

export default apiCall;
