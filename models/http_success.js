// utils/HttpSuccess.js
class HttpSuccess extends Error {
    constructor(message = "Success", data = null) {
        super(message);
        this.success = true;            // helpful flag
        this.message = message;
        this.data = data;
        // this.statusCode = statusCode;   // renamed from 'code' for clarity
    }
}

module.exports = HttpSuccess;