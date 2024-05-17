const express = require("express");
const router = express.Router({ mergeParams: true });

const user_controller = require("../../controllers/userController");

router.get("/", user_controller.users_get);
router.post("/", user_controller.users_post);

router.get("/:id", user_controller.users_get_one);
router.put("/:id", user_controller.users_put);
router.delete("/:id", user_controller.users_delete);

module.exports = router;
