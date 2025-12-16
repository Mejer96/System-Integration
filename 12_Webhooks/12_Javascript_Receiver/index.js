const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const basePath = __dirname;

app.use(express.json());


function appendToJsonFile(filePath, message) {
    let data = [];
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf8");
        if (fileContent) data = JSON.parse(fileContent);
    }
    data.push(message);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}


app.post("/callback/announcement", (req, res) => {
    const message = req.body.message;
    if (!message) return res.status(400).json({ error: "Missing message" });

    const filePath = path.join(basePath, "announcements.json");
    appendToJsonFile(filePath, message);

    console.log("Announcement received:", message);
    res.status(200).json({ status: "ok" });
});

app.post("/callback/release", (req, res) => {
    const message = req.body.message;
    if (!message) return res.status(400).json({ error: "Missing message" });

    const filePath = path.join(basePath, "releases.json");
    appendToJsonFile(filePath, message);

    console.log("Release received:", message);
    res.status(200).json({ status: "ok" });
});

app.post("/callback/reservation", (req, res) => {
    const message = req.body.message;
    if (!message) return res.status(400).json({ error: "Missing message" });

    const filePath = path.join(basePath, "reservations.json");
    appendToJsonFile(filePath, message);

    console.log("Reservation received:", message);
    res.status(200).json({ status: "ok" });
});

app.listen(3000, () => console.log("Receiver server running on port 3000"));
