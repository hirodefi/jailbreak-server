class ErrorBody extends Error {
    constructor(statusCode = 500, message = "Internal Server Error", errors = []) {
        super(message);
        this.name = "CustomError";
        this.statusCode = statusCode;
        this.errors = errors;
        this.status = statusCode;
        Error.captureStackTrace(this, ErrorBody);
    }

}


module.exports = {
    ErrorBody
}