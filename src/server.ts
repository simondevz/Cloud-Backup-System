import dotenv from "dotenv";
import database from "./database";
const makeApp = require("./app");

dotenv.config();
const port = process.env.PORT || 8000;

const app = makeApp(database);
app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
