const express = require("express");
const router = express.Router({ mergeParams: true });

const message_controller = require("../../controllers/messageController");

router.get("/", message_controller.messages_get);
router.post("/", message_controller.messages_post);

router.get("/:id", message_controller.messages_get_one);
router.put("/:id", message_controller.messages_put);
router.delete("/:id", message_controller.messages_delete);

router.post("/find-msg", message_controller.messages_find_msg);

module.exports = router;
