const downloadHandler = require("../handlers/download");
const supertest = require("supertest");
const makeapp = require("../app");

const mock_postgres = {
  users: {
    // This represents a user already in the database
    email: "obidaberechukwu@gamil.com",
    firstname: "Nnaemeka",
    lastname: "Obi",
  },
};

const mock_db = {
  getUser: jest.fn((email) => {
    return mock_postgres.users.email === email ? mock_postgres.users : null;
  }),

  createUser: jest.fn((user) => 1),
  savePath: jest.fn(),
};

const mock_api = {
  uploadFile: jest.fn(),
  uploadFileStart: jest.fn(),
  downloadFile: jest.fn((x, y) => true),
  createFolder: jest.fn(),
  uploadFileAppend: jest.fn(),
  uploadFileFinish: jest.fn(),
};

const app = makeapp(mock_db, mock_api);

describe("POST /download", () => {
  describe("when no file path provided", () => {
    test("should respond with status code 400", async () => {
      supertest(app).get("/download").expect(400);
    });
  });

  describe("when file is provided", () => {
    test("the appropriate functions are called with the rigth credentials, retuns status code 201", async () => {
      const request = {
        session: {
          user: {
            id: 1,
          },
        },
        query: {
          file: "file.pg",
          folder: "new/path/to/folder",
        },
      };

      const response = {
        status: jest.fn((X) => X),
        send: jest.fn((X) => X),
        sendStatus: jest.fn((X) => X),
      };

      await downloadHandler(request, response, mock_api);
      expect(mock_api.downloadFile.mock.calls.length).toBe(1);
      expect(response.status.mock.calls.length).toBe(1);

      expect(mock_api.downloadFile).toBeCalledWith(
        request.session.user.id,
        request.query.file,
        request.query.folder
      );
      expect(response.status.mock.calls.length).toBe(1);
      expect(response.status).toBeCalledWith(200);
    });
  });
});
