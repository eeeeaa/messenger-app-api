const asyncHandler = require("express-async-handler");
const passport = require("passport");
const { body } = require("express-validator");
const {
  validationErrorHandler,
  validIdErrorHandler,
} = require("../handler/validationErrorHandler");
const { getHash } = require("../utils/passwordUtils");

const User = require("../models/user");
const Room = require("../models/room");
const Message = require("../models/message");

exports.users_get = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const allUsers = await User.find()
      .sort({ username: 1 })
      .limit(req.query.limit)
      .exec();
    res.json({
      users: allUsers,
    });
  }),
];

exports.users_get_one = [
  passport.authenticate("jwt", { session: false }),
  validIdErrorHandler,
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).exec();
    if (user === null) {
      const err = new Error("user not found");
      err.status = 404;
      return next(err);
    }
    res.json({
      user: user,
    });
  }),
];

exports.user_get_self = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    res.json({
      user: req.user,
    });
  }),
];

//for admin to create user - no password confirm
exports.users_post = [
  passport.authenticate("jwt", { session: false }),
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("username must not be empty")
    .escape(),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .withMessage("password must not be empty")
    .escape(),
  body("display_name").optional({ values: "falsy" }).trim().escape(),
  body("profile_url").optional({ values: "falsy" }),
  validationErrorHandler,
  asyncHandler(async (req, res, next) => {
    const hash = await getHash(req.body.password);
    const existUser = await User.findOne({ username: req.body.username });

    if (existUser) {
      const err = new Error("User already exists");
      err.status = 409;
      return next(err);
    }
    const user = new User({
      username: req.body.username,
      password: hash,
      display_name: req.body.display_name,
      profile_url: req.body.profile_url,
    });

    user.save();
    res.json({
      user,
    });
  }),
];

exports.users_put = [
  passport.authenticate("jwt", { session: false }),
  body("username")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 1 })
    .withMessage("username must not be empty")
    .escape(),
  body("password")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 1 })
    .withMessage("password must not be empty")
    .escape(),
  body("display_name").optional({ values: "falsy" }).trim().escape(),
  body("profile_url").optional({ values: "falsy" }),
  body("status")
    .optional({ values: "falsy" })
    .custom((input, meta) => {
      return input === "Online" || input === "Offline";
    })
    .withMessage("invalid status type"),
  validationErrorHandler,
  validIdErrorHandler,
  asyncHandler(async (req, res, next) => {
    const existUser = await User.findById(req.params.id);

    if (existUser === null) {
      const err = new Error("User does not exist, can't update");
      err.status = 404;
      return next(err);
    }

    if (req.body.username) {
      const nameExistUser = await User.find({
        username: req.body.username,
      }).exec();

      if (nameExistUser) {
        const err = new Error("Username already used, can't update");
        err.status = 409;
        return next(err);
      }
    }

    let user = null;

    if (req.body.password) {
      const hash = await getHash(req.body.password);
      user = new User({
        username: req.body.username,
        password: hash,
        display_name: req.body.display_name,
        profile_url: req.body.profile_url,
        status: req.body.status,
        _id: req.params.id,
      });
    } else {
      user = new User({
        username: req.body.username,
        display_name: req.body.display_name,
        profile_url: req.body.profile_url,
        status: req.body.status,
        _id: req.params.id,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, user, {
      new: true,
    });
    res.json({
      updatedUser,
    });
  }),
];

exports.users_delete = [
  passport.authenticate("jwt", { session: false }),
  validIdErrorHandler,
  asyncHandler(async (req, res, next) => {
    const existUser = await User.findById(req.params.id).exec();
    if (existUser === null) {
      const err = new Error("User does not exist, can't delete");
      err.status = 404;
      return next(err);
    }

    const [deletedUser, messages] = await Promise.all([
      User.findByIdAndDelete(req.params.id),
      Message.deleteMany({ user: req.params.id }).exec(),
    ]);

    res.json({
      deletedUser,
    });
  }),
];
