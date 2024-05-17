const express = require("express");
const router = express.Router();

const authRouter = require("./v1/auth");
const messageRouter = require("./v1/messages");
const roomsRouter = require("./v1/rooms");
const usersRouter = require("./v1/users");

router.use("/auth", authRouter);
router.use("/rooms", roomsRouter);
router.use("/messages", messageRouter);
router.use("/users", usersRouter);

module.exports = router;
