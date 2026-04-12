const HttpError = require('../models/http_error');

const routerError = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = 500;
    if (typeof err.code === 'number') {
        statusCode = err.code;
    } else if (typeof err.statusCode === 'number') {
        statusCode = err.statusCode;
    } else if (err.name === 'MulterError') {
        statusCode = 400;
    } else if (typeof err.code === 'string') {
        statusCode = 400;
    }

    res.status(statusCode);
    res.json({
        message: err.message || 'An unknown error occurred!',
        code: err.code || statusCode,
    });
}

module.exports = { routerError };