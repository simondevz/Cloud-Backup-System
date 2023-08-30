"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const database_1 = __importDefault(require("./database"));
const apiCalls_1 = __importDefault(require("./apiCalls"));
const makeApp = require("./app");
dotenv.config();
const port = process.env.PORT || 8000;
const app = makeApp(database_1.default, apiCalls_1.default);
app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});
