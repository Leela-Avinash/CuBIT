export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        // In production, consider logging the stack trace rather than sending it in the response.
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
