const { ErrorBody } = require("../utils");
const { validator } = require('web3-validator');

exports.verifyUser = async (req, res, next) => {
    try {
        const { headers: { authorization } } = req;
        let userPublicAddress = authorization.toLowerCase().trim();
        const errors = validator.validate(['address'], [userPublicAddress], { silent: true });
        if (errors) {
            throw new ErrorBody();
        }
        req.userPublicAddress = userPublicAddress;
        next();
    } catch (error) {
        next(new ErrorBody(401, "Unauthorized", []));
    }
}