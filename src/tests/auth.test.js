const request = require("supertest");
const makeApp = require("../app");

const testUser = {
  // add type?
  email: "example@email.com",
  lastName: "Doe",
  FirstName: "John",
  password: "12345678",
};

const createUser = jest.fn();
const getUser = jest.fn();

const app = makeApp({
  createUser,
  getUser,
});

/*
pm.test("Response status code is 403", function () {
    pm.expect(pm.response.code).to.equal(403);
});


pm.test("Response has the required field - message", function () {
    const responseData = pm.response.json();

    pm.expect(responseData).to.have.property('message').that.is.a('string');
});


pm.test("Message is a non-empty string", function () {
    const responseData = pm.response.json();

    pm.expect(responseData).to.be.an('object');
    pm.expect(responseData.message).to.be.a('string').and.to.have.lengthOf.at.least(1, "Value should not be empty");
});


pm.test("Response time is less than 200ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(200);
});


pm.test("Response content type is JSON", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});

*/
describe("POST /signup", () => {
  describe("given email, name and password", () => {
    // should hash the password
    test("should save the details and hashed password in database", async () => {
      await request.post("/signup").send(testUser);
      expect(createUser.mock.calls.length).toBe(1);

      expect(createUser.mock.calls[0][0]).toBe("email");
      expect(createUser.mock.calls[0][1]).toBe("firstName");
      expect(createUser.mock.calls[0][2]).toBe("lastName");
      expect(createUser.mock.calls[0][3]).toBe("password");
    });
    // should sent jwt back to client

    test("should respond with status code 200", async () => {
      const response = await request(app).post("/login").send(testUser);
      expect(response.statusCode).toBe(200);
    });

    test("should specify json in the content type header", async () => {
      const response = await request(app).post("/login").send(testUser);
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });

    test("response has jwt token", async () => {
      const response = await request(app).post("/login").send(testUser);
      expect(response.body.jwt).toBeDefined(); // come back to this
    });
    // should send back a 500 status code if db can not be connected to
  });

  describe("when email, name or password is missing", () => {
    test("should respond with status code 400", async () => {
      const bodyData = [
        { email: "example@email.com" },
        { lastName: "Doe" },
        { password: "12345678" },
        { email: "example@email.com", lastName: "Doe" },
        { lastName: "Doe", password: "12345678" },
        { email: "example@email.com", password: "12345678" },
        {},
      ];

      for (let body of bodyData) {
        const response = await request(app).post("/signup").send(body);
        expect(response.statusCode).toBe(400);
      }
    });
    // should respond with an error message
    // should specify json in the content type header
  });
});
