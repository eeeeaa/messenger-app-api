const asyncHandler = require("express-async-handler");
const passport = require("passport");
const { body } = require("express-validator");
const {
  validationErrorHandler,
  validIdErrorHandler,
} = require("../handler/validationErrorHandler");

const Room = require("../models/room");
const Message = require("../models/message");

exports.rooms_get = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const rooms = await Room.find({}).exec();

    return res.json({
      rooms,
    });
  }),
];

exports.rooms_get_one = [
  passport.authenticate("jwt", { session: false }),
  validIdErrorHandler,
  asyncHandler(async (req, res, next) => {
    const room = await Room.findById(req.params.id).exec();

    if (room === null) {
      const err = new Error("room not found");
      err.status = 404;
      return next(err);
    }

    return res.json({
      room,
    });
  }),
];

exports.rooms_post = [
  passport.authenticate("jwt", { session: false }),
  body("room_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("room name must not be empty")
    .escape(),
  body("users").optional({ values: "falsy" }).isArray(),
  validationErrorHandler,
  asyncHandler(async (req, res, next) => {
    const room = new Room({
      room_name: req.body.room_name,
      users: req.body.users,
    });

    await room.save();

    return res.json({
      room,
    });
  }),
];

exports.rooms_put = [
  passport.authenticate("jwt", { session: false }),
  validIdErrorHandler,
  body("room_name").optional({ values: "falsy" }).trim().escape(),
  body("users").optional({ values: "falsy" }).isArray(),
  validationErrorHandler,
  asyncHandler(async (req, res, next) => {
    const existRoom = await Room.findById(req.params.id).exec();

    if (existRoom === null) {
      const err = new Error("room not found");
      err.status = 404;
      return next(err);
    }

    const room = new Room({
      room_name: req.body.room_name,
      users: req.body.users,
      _id: req.params.id,
    });

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, room, {
      new: true,
    });

    return res.json({ updatedRoom });
  }),
];

exports.rooms_delete = [
  passport.authenticate("jwt", { session: false }),
  validIdErrorHandler,
  asyncHandler(async (req, res, next) => {
    const existRoom = await Room.findById(req.params.id).exec();

    if (existRoom === null) {
      const err = new Error("room not found");
      err.status = 404;
      return next(err);
    }

    const [deletedRoom, messages] = await Promise.all([
      Room.findByIdAndDelete(req.params.id),
      Message.deleteMany({ room: req.params.id }),
    ]);

    return res.json({
      deletedRoom: deletedRoom,
      deleteMsgCount: messages.deletedCount,
    });
  }),
];
