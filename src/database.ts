require("dotenv").config();
const pgp = require("pg-promise")();

const username = process.env.PG_USERNAME;
const password = process.env.PG_PASSWORD;
const host = process.env.PG_HOST;
const port = process.env.PG_PORT;
const pg_database = process.env.PG_DB;

const db = pgp(
  `postgres://${username}:${password}@${host}:${port}/${pg_database}`
);

export interface databaseType {
  getUser: (email: string) => Promise<any>;
  createUser: (user: any) => Promise<any>;
  savePath: (path: string, id: number) => Promise<void>;
}

const database = {
  getUser: async (email: string) => {
    const user = await db.oneOrNone("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    return user;
  },

  createUser: async (user: any) => {
    const { id } = await db.one(
      "INSERT INTO users(email, lastname, firstname, salt, hash) VALUES($1, $2, $3, $4, $5) RETURNING id",
      [user.email, user.lastname, user.firstname, user.salt, user.hash]
    );
    return id;
  },

  savePath: async (path: string, id: number) => {
    await db.none("INSERT INTO folders(folder_path, user_id) VALUES($1, $2)", [
      path,
      id,
    ]);
  },
};

export default database;
