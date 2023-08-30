const dotenv = require("dotenv");
import database from "./database";
import apiCall from "./apiCalls";
const makeApp = require("./app");

dotenv.config();
const port = process.env.PORT || 3000;

const app = makeApp(database, apiCall);
app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
