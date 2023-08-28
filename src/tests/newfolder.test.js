const newfolderHandler = require("../handlers/newfolder");

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
  downloadFile: jest.fn(),
  createFolder: jest.fn(),
  uploadFileAppend: jest.fn(),
  uploadFileFinish: jest.fn(),
};

describe("POST /newfolder", () => {
  describe("when no folder path provided", () => {
    test("should respond with status code 400", async () => {
      const request = {
        session: {
          user: {
            id: 1,
          },
        },
        body: {},
      };

      const response = {
        status: jest.fn((X) => X),
        send: jest.fn((X) => X),
        sendStatus: jest.fn((X) => X),
      };

      await newfolderHandler(request, response, mock_db, mock_api);
      expect(response.status.mock.calls.length).toBe(1);
      expect(response.status).toBeCalledWith(400);

      expect(mock_api.createFolder.mock.calls.length).toBe(0);
      expect(mock_db.savePath.mock.calls.length).toBe(0);
    });
  });

  describe("when path is provided", () => {
    test("the appropriate functions are called with the rigth credentials, retuns status code 201", async () => {
      const request = {
        session: {
          user: {
            id: 1,
          },
        },
        body: { path: "new/path/to/folder" },
      };

      const response = {
        status: jest.fn((X) => X),
        send: jest.fn((X) => X),
        sendStatus: jest.fn((X) => X),
      };

      await newfolderHandler(request, response, mock_db, mock_api);
      expect(mock_api.createFolder.mock.calls.length).toBe(1);
      expect(mock_db.savePath.mock.calls.length).toBe(1);

      expect(mock_api.createFolder).toBeCalledWith(
        request.session.user.id,
        request.body.path
      );
      expect(mock_db.savePath).toBeCalledWith(
        request.body.path,
        request.session.user.id
      );
      expect(response.status.mock.calls.length).toBe(1);
      expect(response.status).toBeCalledWith(201);
    });
  });
});
