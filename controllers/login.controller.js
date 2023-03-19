const User = require("../schemas/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function post(req, res) {
	const { email, password } = req.body;
	const user = await User.findOne({ email: email }, 'email username hashedPassword');
	if (user) {
		// Check hashed password here
		if (bcrypt.compareSync(password, user.hashedPassword)) {
			// Generate new JWT
			const newToken = jwt.sign({ userEmail: email }, process.env.SECRET_KEY, {
				expiresIn: "24h",
			});
			// Overwrite the old JWT
			user.loginToken = newToken;
			await user.save();
			delete user['hashedPassword'];
			return res
				.status(200)
				.send({ result: "SUCCESS", loginToken: newToken, user: user });
		} else {
			return res.status(400).send({
				result: "FAIL",
				error: "Username or password not correct",
			});

		}
	}
	return res.status(400).send({
		result: "FAIL",
		error: "Username or password not correct",
	});
}

module.exports = {
	post
}