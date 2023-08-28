const request = require("supertest");
const makeApp = require("../app");

const testUser = [
  {
    email: "example@email.com",
    password: "12345678",
  },
  { email: "example@email.com" },
  { password: "12345678" },
];

const wrongPasswordUser = {
  email: "example@email.com",
  password: "wrong 12345678",
};
const wrongEmailUser = {
  email: "example@email.com",
  password: "wrong 12345678",
};

const mock_postgres = {
  // This represents a user already in the database
  users: {
    email: "example@email.com",
    firstname: "John",
    lastname: "Doe",
    salt: "WG9XDO6u1r1AWJr4DZUgM5sE4l0CcT+ToHq/BrMlKDGmC/MEttgIbIVpO6JNniejD8OHbY9lRftSojjZ9L5Acw==",
    hash: "ZQ7GlBNDF3KfLhXRbmaI/lV1oxrefDKNO7DqENrcy8n9sSuEKqRI46F77LvqdrmgJ58d4J5g60aRn9GL5Rb3bcfiGSWGoKsHQuL+ZVoJqyG+z7S5X9z3wpcIPBNkFHvdQ+dIrMZql9DO3e92Fa4RVyseTYNpTDjlgebMQzyjvIQ=",
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

describe("POST /login", () => {
  describe("missing credentials", () => {
    test("should return response status of 400", async () => {
      for (let i = 1; i < testUser.length; i++) {
        const response = await request(app).post("/login").send(testUser[i]);
        expect(response.statusCode).toBe(400);
        expect(mock_db.getUser.mock.calls.length).toBe(0);
      }
    });
  });

  describe("valid credentials", () => {
    test("db get user is called", async () => {
      const response = await request(app).post("/login").send(testUser[0]);
      expect(mock_db.getUser.mock.calls.length).toBe(1);
      expect(mock_db.getUser).toBeCalledWith(testUser[0].email);
      expect(response.statusCode).toBe(200);
    });
  });

  describe("wrong email", () => {
    test("db get user is called", async () => {
      const response = await request(app).post("/login").send(wrongEmailUser);
      expect(mock_db.getUser.mock.calls.length).toBe(2);
      expect(mock_db.getUser).toBeCalledWith(wrongEmailUser.email);
      expect(response.statusCode).toBe(401);
    });
  });

  describe("wrong password", () => {
    test("db get user is called", async () => {
      const response = await request(app)
        .post("/login")
        .send(wrongPasswordUser);
      expect(mock_db.getUser.mock.calls.length).toBe(3);
      expect(mock_db.getUser).toBeCalledWith(wrongPasswordUser.email);
      expect(response.statusCode).toBe(401);
    });
  });
});
