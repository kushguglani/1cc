module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    console.log(err);
    if (typeof (err) === 'string') {
        // custom application error
        return res.status(404).json({ message: err, status:0 });
    }

    if (res.status === 404) {
        // mongoose validation error
        return res.status(404).json({ message: err });
    }

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).json({ message: 'Invalid Token', status:0 });
    }

    // default to 500 server error
    return res.status(500).json({ message: err.message, status:0 });
    // return res.status(500).json({ message: err.message, status:0 });
}