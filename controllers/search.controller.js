const User = require("../schemas/User");

async function get(req, res) {
	const query = req.query.searchQuery;
	console.log(query);
	if (query) {
		const data = await User.find({ username: query }, '_id email username');
		if (data) {
			return res.status(200).send({ users: data });
		} else {
			return res.status(200).send({ users: [] });
		}
	} else {
		return res
			.status(400)
			.send({ result: "FAIL", error: "Search query is empty" });
	}
}

module.exports = { get };
