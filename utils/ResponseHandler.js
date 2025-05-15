module.exports = (res, next, responseBody = {}, statusCode = 200, contentType = "application/json") => {
    try {
        res.status(statusCode);
        res.setHeader("content-Type", contentType);
        res.json(responseBody);
    } catch (error) {
        next([400, 401, 403].includes(error.status) ? error : {});
    }
}