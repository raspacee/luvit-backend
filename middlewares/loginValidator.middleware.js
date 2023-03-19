const User = require('../schemas/User');
const jwt = require("jsonwebtoken");

const loginValidator = async (req, res, next) => {
	const auth = req.headers["authorization"];
	try {
		const decoded = jwt.verify(auth.split(" ")[1], process.env.SECRET_KEY);
		const user = await User.findOne({ email: decoded.userEmail });
		decoded['_id'] = user._id;
		req.decoded = decoded;
		return next();
	} catch (err) {
		return res
			.status(400)
			.send({ result: "FAIL", error: "Login token is not valid" });
	}
};

module.exports = loginValidator;
