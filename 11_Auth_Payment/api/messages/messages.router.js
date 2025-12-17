const express = require("express");
const http = require("https");
const fs = require("fs");
const path = require("path");

const {
  getAdminMessage,
  getProtectedMessage,
  getPublicMessage,
} = require("./messages.service");


const { validateAccessToken } = require("../middleware/auth0.middleware.js");

const router = express.Router();

router.get("/public", (req, res) => {
  const message = getPublicMessage();

  res.status(200).json(message);
});

router.get("/protected", validateAccessToken, (req, res) => {
  const message = getProtectedMessage();

  res.status(200).json(message);
});

router.get("/admin", validateAccessToken, (req, res) => {
  const message = getAdminMessage();

  res.status(200).json(message);
});

router.get("/create-payment", validateAccessToken, (req, res) => {

	const options = {
		"method": "POST",
		"hostname": "test.api.dibspayment.eu",
		"port": 443,
		"path": "/v1/payments",
		"headers": {
			"content-type": "application/json",
			"Authorization": "b64872df35a34071b0e3c431a6ba101e"
		}
	};

	const restreq = http.request(options, function (resp) {
		const chunks = [];

		console.log("statusCode: ", resp.statusCode);
		console.log("headers: ", resp.headers);

		resp.on("data", function (chunk) {
			console.log("on data");
			chunks.push(chunk);
		});
		resp.on("end", function () {
			const body = Buffer.concat(chunks);
			console.log(body.toString());
			res.send(body.toString());
		});
	});

  // Read hard-coded payload from file in this example.
	// This is where you would normally generate a 
	// json object dynamically based on the current order.
    const payloadPath = path.join(__dirname, "payload.json");
	let payload = fs.readFileSync(payloadPath, "utf-8");
	restreq.write(payload);
	// console.log(JSON.parse(payload));

	restreq.on('error', function (e) {
		console.error('error');
		console.error(e);

	});
	restreq.end();
})

module.exports = { messagesRouter: router };