const { logger } = require("../logs/winston");
const ErrorResponse = require("../utils/errorResponse");
const errorHandler = (err, req, res, next) => {

    let error = { ...err };
    error.message = err.message;
    //Log to console for dev

    console.log(err);
    logger.error(err);
    //mysql bad ObjectId

    //42601  --invalid query
    if (err.type === "entity.parse.failed") {
        const message = `Sorry, Invalid Json Fields`;
        error = new ErrorResponse(message, 404);
        logger.error(error);
    }

    

    //mysql db access denied to user
    if (err.code === "ER_DUP_ENTRY") {
        const message = `Duplicate entry found in request`;
        error = new ErrorResponse(message, 404);
      }
    
      if (err.code === "ER_ACCESS_DENIED_ERROR") {
        const message = `Db access denied`;
        error = new ErrorResponse(message, 404);
      }
      if (err.code === "ETIMEDOUT") {
        const message = `System connection timeout`;
        error = new ErrorResponse(message, 404);
      }
    
      if (err.code === "ER_BAD_FIELD_ERROR") {
        const message = `Unknown column in request`;
        error = new ErrorResponse(message, 404);
      }
    
      if (err.code === "ER_NO_SUCH_TABLE") {
        const message = `Unknown table in request`;
        error = new ErrorResponse(message, 404);
      }
    logger.error(error.message);
    res.status(error.statusCode || 500).json({
        status: 0,
        message: error.message || "Server Error",
    });
};

module.exports = errorHandler;
