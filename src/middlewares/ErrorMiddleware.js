
const notFound = (req, res, next) => {
    const error = new Error(
        `Route not found: ${req.originalUrl}`
    );

    error.statusCode = 404;

    next(error);
};


const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;

    console.error("Server Error:", err);

    return res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500
                ? "Internal server error"
                : err.message
    });
};


module.exports = {
    notFound,
    errorHandler
};
