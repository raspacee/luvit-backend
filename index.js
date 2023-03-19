require('dotenv').config()

const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");
const server = http.createServer(app);
const mongoose = require("mongoose");

const loginValidator = require("./middlewares/loginValidator.middleware");

const registerRouter = require("./routes/register.route");
const loginRouter = require("./routes/login.route");
const friendRequestRouter = require("./routes/friendRequests.route");
const friendRouter = require("./routes/friends.route");
const searchRouter = require("./routes/search.route");

//socket
const jwt = require("jsonwebtoken");
const User = require("./schemas/User");
const Message = require('./schemas/Message');
const { v4: uuidv4 } = require("uuid");
const InMemorySessionStore = require("./sessionStore");
const Friend = require('./schemas/Friend');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

const sessionStore = new InMemorySessionStore();

const io = require("socket.io")(server, {
  cors: {
    origin: "https://luvit.onrender.com",
  },
});

io.use(async (socket, next) => {
  // Checking for older connection
  const sessionId = socket.handshake.auth.sessionId;
  if (sessionId) {
    const session = sessionStore.findSession(sessionId);
    if (session) {
      socket.sessionId = sessionId;
      socket.userEmail = session.userEmail;
      socket.username = session.username;
      return next();
    }
  }

  // New connections go here
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const user = await User.findOne({ email: decoded.userEmail });
      if (user) {
        socket.sessionId = uuidv4();
        socket.userEmail = user.email;
        socket.username = user.username;
        sessionStore.saveSession(socket.sessionId, { userEmail: socket.userEmail, username: socket.username });
        return next();
      }
      return next(new Error("invalid userID inside token"));
    } catch (err) {
      return next(new Error("invalid token"));
    }
  } else {
    return next(new Error("token required"));
  }
});

io.on("connection", (socket) => {
  // Get all currently connected users
  // const users = [];
  // for (let [id, socket] of io.of("/").sockets) {
  //   users.push({
  //     userEmail: socket.userEmail,
  //   });
  // }
  const emitFriends = async () => {
    const user = await User.findOne({ email: socket.userEmail });
    const docs = await Friend.find({
      $or: [{ user1: user._id }, { user2: user._id }],
    });
    const friendsId = docs.map((doc) => {
      if (doc.user1.equals(user._id)) return doc.user2;
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
        if (friends.length) {
          const toReturn = [];
          friends.forEach(f => toReturn.push(f.toObject()));
          tmp = toReturn.map(f => ({ ...f, chat: [] }))
          socket.emit("friends", tmp);

        }
      }
    );
  }
  emitFriends();

  // Emit to the newly connected user
  // Emit the session also
  socket.emit("session", {
    sessionId: socket.sessionId,
    userEmail: socket.userEmail,
    username: socket.username 
  });

  // Connect by userEmail so session can be saved
  socket.join(socket.userEmail);

  // Broadcast to all other users
  socket.broadcast.emit("user connected", {
    userEmail: socket.userEmail,
  });

  socket.on("private message", ({ message, to, time }) => {
    socket.to(to).emit("private message", {
      message,
      from: socket.userEmail,
      fromUsername: socket.username,
      time,
    });
    console.log(message, to, time);
    const msg = new Message({
      textBody: message,
      sender: socket.userEmail,
      receiver: to,
      timestamp: time,
    });
    msg.save((err) => {
      if (err) {
        // socket.emit(err);
        console.log(err);
      }
      // socket.emit("message sent");
      console.log('message saved');
    });
  });
});

//EIidNuyrlq5aKhUZ
mongoose.set("strictQuery", false);
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.DATABASE_URI);
  console.log("Database connected");
}

app.use("/api/register", registerRouter);

app.use("/api/login", loginRouter);

app.use("/api/friendRequests", loginValidator, friendRequestRouter);

app.use("/api/friends", loginValidator, friendRouter);

app.use("/api/search", loginValidator, searchRouter);

server.listen(4000, () => {
  console.log("listening on *:4000");
});
