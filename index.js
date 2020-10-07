import express from "express";
import {promises as fs} from "fs";
import gradesRouter from "./routes/grades.js";

const { readFile } = fs;

global.fileName = "grades.json";
const app = express();
app.use(express.json());
app.use("/grade", gradesRouter);

app.listen(3000, async () => {
    await readFile(fileName);
    console.log("API started");
});