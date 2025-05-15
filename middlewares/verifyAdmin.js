const { ErrorBody } = require("../utils");
const { validator } = require('web3-validator');


exports.verifyAdmin = async (req, res, next) => {
    try {
        const { headers: { authorization } } = req;
        let adminAddress = authorization.toLowerCase().trim();
        if (adminAddress !== process.env.ADMIN_ADDRESS.toLowerCase()) {
            throw new ErrorBody();
        }
        const errors = validator.validate(['address'], [adminAddress], { silent: true });
        if (errors) {
            throw new ErrorBody();
        }
        next();
    } catch (error) {
        next(new ErrorBody(401, "Unauthorized", []));
    }
}