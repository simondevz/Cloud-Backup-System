const request = require("supertest");
const makeApp = require("../app");

const testUser = [
  {
    email: "example@email.com",
    lastname: "Doe",
    firstname: "John",
    password: "12345678",
  },
  {
    email: "example@email.com",
    lastname: "Doe",
    password: "12345678",
  },
  {
    email: "example@email.com",
    firstname: "John",
    password: "12345678",
  },
  {
    email: "exampleemail",
    lastname: "Doe",
    firstname: "John",
    password: "12345678",
  },
  {
    email: "example@email.com",
    lastname: "Doe",
    firstname: "John",
  },
  {
    lastname: "Doe",
    firstname: "John",
    password: "12345678",
  },
];

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

const app = makeApp(mock_db, mock_api);

describe("POST /signup", () => {
  describe("invalid credentials", () => {
    test("should respond with status code 400 && database and api calls should not be made ", async () => {
      for (let i = 1; i < testUser.length; i++) {
        const response = await request(app).post("/signup").send(testUser[i]);
        expect(response.statusCode).toBe(400);
        expect(mock_db.getUser.mock.calls.length).toBe(0);
        expect(mock_db.createUser.mock.calls.length).toBe(0);
        expect(mock_api.createFolder.mock.calls.length).toBe(0);
      }
    });
  });

  describe("valid credentials", () => {
    test("the appropriate functions are called with the rigth credentials, retuns status code 201", async () => {
      const response = await request(app).post("/signup").send(testUser[0]);
      expect(mock_db.getUser.mock.calls.length).toBe(1);
      expect(mock_db.createUser.mock.calls.length).toBe(1);
      expect(mock_api.createFolder.mock.calls.length).toBe(1);

      expect(mock_db.getUser).toBeCalledWith(testUser[0].email);
      expect(mock_api.createFolder).toBeCalledWith(1, null); // 1 being the return value of the createuser function meaning it was called
      expect(response.statusCode).toBe(201);
    });
  });

  describe("existing user", () => {
    test("returns status 403 && createUser and createFolder are not called", async () => {
      const response = await request(app)
        .post("/signup")
        .send({ ...mock_postgres.users, password: "some password" });

      expect(mock_db.getUser.mock.calls.length).toBe(2); // because i have used the function before in a former test
      expect(mock_db.createUser.mock.calls.length).toBe(1);
      expect(mock_api.createFolder.mock.calls.length).toBe(1);
      expect(response.statusCode).toBe(403);
    });
  });
});
