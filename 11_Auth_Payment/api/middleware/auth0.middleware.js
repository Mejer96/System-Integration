const { auth } = require("express-oauth2-jwt-bearer");
const dotenv = require("dotenv");

dotenv.config();

const validateAccessToken = auth({
    audience: 'http://localhost:3001',
    issuerBaseURL: 'https://dev-kyyqmmxci28c240u.us.auth0.com/',
    tokenSigningAlg: 'RS256'
  });

module.exports = {
  validateAccessToken,
};