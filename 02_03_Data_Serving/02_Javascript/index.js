const express = require("express");
const path = require("path");
const axios = require("axios");
const FileParserCustom = require("../../01_Data_Parsing/01_Javascript/fileParser");

const app = express();
const parser = new FileParserCustom();
const PYTHON_ENDPOINT = "http://localhost:8000"
const basePath = path.join(__dirname, "../../01_Data_Parsing/01_Javascript/files");


const file_name = "inglorious_bastards"



app.get("/movie/json", (req, res) => {
    console.log("debug")
    const data = parser.parseJson(path.join(basePath, file_name + ".json"));
    res.type("application/json").send(data);
});

app.get("/movie/xml", (req, res) => {
    const data = parser.parseXml(path.join(basePath, file_name + ".xml"));
    res.type("application/xml").send(data);
});

app.get("/movie/yaml", (req, res) => {
    const data = parser.parseYaml(path.join(basePath, file_name + ".yaml"));
    res.type("text/yaml").send(data);
});

app.get("/movie/text", (req, res) => {
    const data = parser.parseText(path.join(basePath, file_name + ".txt"));
    res.type("text/plain").send(data);
});

app.get("/movie/csv", (req, res) => {
    const data = parser.parseCsv(path.join(basePath, file_name + ".csv"));
    res.type("text/csv").send(data);
});

app.get("/sts/json", async (req, res) => {
    const response = await axios.get(`${PYTHON_ENDPOINT}/movie/json`);
    res.type("application/json").send(response.data);
});

app.get("/sts/xml", async (req, res) => {
    const response = await axios.get(`${PYTHON_ENDPOINT}/movie/xml`);
    res.type("application/xml").send(response.data);
});

app.get("/sts/yaml", async (req, res) => {
    const response = await axios.get(`${PYTHON_ENDPOINT}/movie/yaml`);
    res.type("text/yaml").send(response.data);
});

app.get("/sts/text", async (req, res) => {
    const response = await axios.get(`${PYTHON_ENDPOINT}/movie/text`);
    res.type("text/plain").send(response.data);
});

app.get("/sts/csv", async (req, res) => {
    const response = await axios.get(`${PYTHON_ENDPOINT}/movie/csv`);
    res.type("text/csv").send(response.data);
});

app.listen(3000, () => console.log("Server running on port 3000"));
