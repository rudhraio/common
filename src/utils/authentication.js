function authentication(req, res, next) {

    const TOKEN = process.env.TOKEN;
    const { token } = req.headers;
    if (token !== TOKEN) {
        let status = 403, message = (token ? "Invalid" : "No") + " token sent";
        return res.status(status).json({
            status: status,
            message: message
        });
    }
    return next();

};

export default authentication;