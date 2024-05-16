const asyncHandler = require("express-async-handler");
const passport = require("passport");
const { body } = require("express-validator");
const {
  validationErrorHandler,
  validIdErrorHandler,
} = require("../handler/validationErrorHandler");

const mongoose = require("mongoose");

const Message = require("../models/message");
const Room = require("../models/room");
const User = require("../models/user");

exports.messages_get = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const allMsgs = await Message.find({}).sort({ created_at: -1 }).exec();

    return res.json({
      messages: allMsgs,
    });
  }),
];

exports.messages_get_one = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const message = await Message.findById(req.params.id).exec();

    if (message === null) {
      const err = new Error("message not found");
      err.status = 404;
      return next(err);
    }

    return res.json({
      message,
    });
  }),
];

exports.messages_post = [
  passport.authenticate("jwt", { session: false }),
  body("room")
    .isLength({ min: 1 })
    .withMessage("room id must not be empty")
    .custom((input, meta) => {
      return mongoose.Types.ObjectId.isValid(input);
    })
    .withMessage("invalid id"),
  body("user")
    .isLength({ min: 1 })
    .withMessage("user id must not be empty")
    .custom((input, meta) => {
      return mongoose.Types.ObjectId.isValid(input);
    })
    .withMessage("invalid id"),
  body("message_content")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 200 })
    .withMessage("message exceed limit of 200 characters")
    .escape(),
  body("image_url").optional({ values: "falsy" }).isURL(),
  body("created_at").optional({ values: "falsy" }).isISO8601().toDate(),
  validationErrorHandler,
  asyncHandler(async (req, res, next) => {
    const [existRoom, existUser] = await Promise.all[
      (Room.findById(req.body.room).exec(), User.findById(req.body.user).exec())
    ];

    if (existRoom === null || existUser === null) {
      const err = new Error("room and/or user not found");
      err.status = 404;
      return next(err);
    }

    const message = new Message({
      user: req.body.user,
      room: req.body.room,
      message_content: req.body.message_content,
      image_url: req.body.image_url,
      created_at: req.body.created_at,
    });

    await message.save();

    return res.json({
      message: message,
    });
  }),
];

//not support room and user change
exports.messages_put = [
  passport.authenticate("jwt", { session: false }),
  validIdErrorHandler,
  body("message_content")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 200 })
    .withMessage("message exceed limit of 200 characters")
    .escape(),
  body("image_url").optional({ values: "falsy" }).isURL(),
  body("created_at").optional({ values: "falsy" }).isISO8601().toDate(),
  validationErrorHandler,
  asyncHandler(async (req, res, next) => {
    const existMsg = await Message.findById(req.params.id).exec();

    if (existMsg === null) {
      const err = new Error("message not found");
      err.status = 404;
      return next(err);
    }

    const message = {
      message_content: req.body.message_content,
      image_url: req.body.image_url,
      created_at: req.body.created_at,
      _id: req.params.id,
    };

    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      message,
      { new: true }
    );

    return {
      updatedMessage,
    };
  }),
];

exports.messages_delete = [
  passport.authenticate("jwt", { session: false }),
  validIdErrorHandler,
  asyncHandler(async (req, res, next) => {
    const existMsg = await Message.findById(req.params.id).exec();

    if (existMsg === null) {
      const err = new Error("message not found");
      err.status = 404;
      return next(err);
    }

    const deletedMessage = await Message.findByIdAndDelete(req.params.id);

    return res.json({
      deletedMessage,
    });
  }),
];

exports.messages_find_msg = [
  passport.authenticate("jwt", { session: false }),
  body("room_id")
    .optional({ values: "falsy" })
    .isLength({ min: 1 })
    .withMessage("room id must not be empty")
    .custom((input, meta) => {
      return mongoose.Types.ObjectId.isValid(input);
    })
    .withMessage("invalid id"),
  body("user_id")
    .optional({ values: "falsy" })
    .isLength({ min: 1 })
    .withMessage("user id must not be empty")
    .custom((input, meta) => {
      return mongoose.Types.ObjectId.isValid(input);
    })
    .withMessage("invalid id"),
  validationErrorHandler,
  asyncHandler(async (req, res, next) => {
    const [existRoom, existUser] = await Promise.all[
      (Room.findById(req.body.room_id).exec(),
      User.findById(req.body.user_id).exec())
    ];

    if (existRoom === null && existUser === null) {
      const allMsgs = await Message.find({}).exec();
      return res.json({ messages: allMsgs });
    } else if (existRoom === null && existUser !== null) {
      const allMsgs = await Message.find({
        user: req.body.user_id,
      }).exec();
      return res.json({ messages: allMsgs });
    } else if (existRoom !== null && existUser === null) {
      const allMsgs = await Message.find({
        room: req.body.room_id,
      }).exec();
      return res.json({ messages: allMsgs });
    } else {
      const allMsgs = await Message.find({
        user: req.body.user_id,
        room: req.body.room_id,
      }).exec();
      return res.json({ messages: allMsgs });
    }
  }),
];
