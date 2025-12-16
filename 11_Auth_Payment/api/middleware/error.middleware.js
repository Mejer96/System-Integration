const {
    InvalidTokenError,
    UnauthorizedError,
  } = require("express-oauth2-jwt-bearer");
  
  const errorHandler = (error, request, response, next) => {
    if (error instanceof InvalidTokenError) {
      const message = "Bad credentials";
  
      response.status(error.status).json({ message });
  
      return;
    }
  
    if (error instanceof UnauthorizedError) {
      const message = "Requires authentication";
  
      response.status(error.status).json({ message });
  
      return;
    }
  
    const status = 500;
    const message = error.message;
  
    response.status(status).json({ message });
  };
  
  module.exports = {
    errorHandler,
  };