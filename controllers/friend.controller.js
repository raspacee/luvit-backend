const User = require("../schemas/User");
const Friend = require("../schemas/Friend");

async function get(req, res) {
	const docs = await Friend.find({
		$or: [{ user1: req.decoded._id }, { user2: req.decoded._id }],
	});
	const friendsId = docs.map((doc) => {
		if (doc.user1.equals(req.decoded._id)) return doc.user2;
		else return doc.user1;
	});
	User.find(
		{
			_id: { $in: friendsId },
		},
		'_id username email',
		function (err, friends) {
			if (err) {
				console.log(err);
				return res.status(400).send(err);
			}
			return res.status(200).send({
				friends: friends,
			});
		}
	);
}

module.exports = {
	get,
};
