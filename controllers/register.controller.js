const User = require("../schemas/User");
const bcrypt = require("bcryptjs");

async function post(req, res) {
	const { username, email, password } = req.body;
	if (username !== "" && email !== "" && password !== "") {
		// Hash the password here
		const salt = bcrypt.genSaltSync(10);
		const hashedPassword = bcrypt.hashSync(password, salt);
		try {
			const user = new User({
				username,
				email,
				hashedPassword: hashedPassword,
			});
			user.save((err) => {
				if (err) {
					return res.status(400).send({ result: "FAIL", error: err });
				}
				return res.status(201).send({
					result: "SUCCESS",
					msg: "Your account is created successfully",
				});
			});
		} catch (err) {
			console.log(err);
		}
	}
}

module.exports = {
	post
}
