const FriendRequest = require("../schemas/FriendRequest");
const Friend = require("../schemas/Friend");
const User = require("../schemas/User");

async function post(req, res) {
	const { receiverEmail } = req.body;
	console.log(req.body);
	const senderEmail = req.decoded.userEmail;
	const receiver = await User.findOne({ email: receiverEmail });
	const sender = await User.findOne({ email: senderEmail });
	const requestSent = await FriendRequest.findOne({
		$or: [
			{ sender: sender._id, receiver: receiver._id },
			{ receiver: sender._id, sender: receiver._id },
		],
	});
	if (requestSent) {
		return res
			.status(400)
			.send({ result: "FAIL", error: "Friend request already sent" });
	}
	if (sender && receiver) {
		const friendRequest = new FriendRequest({
			sender: sender._id,
			receiver: receiver._id,
		});
		friendRequest.save((err) => {
			if (err) {
				console.log(err);
				return res
					.status(400)
					.send({ result: "FAIL", error: "Something wrong" });
			}
		});
		return res
			.status(200)
			.send({ result: "SUCCESS", message: "Friend Request sent!" });
	}
	return res.status(404).send({ result: "FAIL", error: "Friend not found" });
}

async function get(req, res) {
	const docs = await FriendRequest.find({
		receiver: req.decoded._id.toString(),
	});
	if (docs.length) {
		const requests = docs.map((doc) => doc.sender);
		User.find(
			{ _id: { $in: requests } },
			"email username",
			function (err, users) {
				if (err) {
					return res.status(400).send(err);
				}
				newUsers = users.map(user => user.toObject());
				if (newUsers.length) {
					for (let i=0; i<docs.length; i++) {
						newUsers[i].friendRequestId = docs[i]._id.toString();
					}
					return res.status(200).send({ requests: newUsers });
				} else {
					return res.status(200).send({
						requests: [],
					});
				}
			}
		);
	} else {
		return res.status(200).send({
			requests: [],
		});
	}
}

async function patch(req, res) {
	const { friendRequestId, choice } = req.body;
	let friendRequest;
	try {
		friendRequest = await FriendRequest.findOne({ _id: friendRequestId });
	} catch (CastError) {
		return res.status(400).send({
			result: "FAIL",
			error: "Invalid friend request ID",
		});
	}
	if (friendRequest) {
		if (friendRequest.receiver._id.equals(req.decoded._id)) {
			switch (choice) {
				case "ACCEPT":
					const friend = new Friend({
						user1: friendRequest.sender,
						user2: friendRequest.receiver,
					});
					friend.save(async (err) => {
						if (err) {
							return res
								.status(400)
								.send({ result: "FAIL", error: err });
						}
						await FriendRequest.deleteOne({
							_id: friendRequest._id,
						});
					});
					return res.status(201).send({
						result: "SUCCESS",
						message: "You are friends now!",
					});
					break;
				case "REJECT":
					await FriendRequest.deleteOne({ _id: friendRequest._id });
					return res.status(200).send({
						result: "SUCCESS",
						message: "Friend request rejected",
					});
					break;
				default:
					return res.status(400).send({
						result: "FAIL",
						message: "Invalid choice/action",
					});
			}
		} else {
			return res.status(403).send({
				result: "FAIL",
				error: "You are not allowed to accept this request",
			});
		}
	} else {
		return res
			.status(404)
			.send({ result: "FAIL", error: "Friend request doesn't exist" });
	}
}

module.exports = {
	post,
	patch,
	get,
};
