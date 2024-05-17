const express = require("express");
const router = express.Router({ mergeParams: true });

const room_controller = require("../../controllers/roomController");

router.get("/", room_controller.rooms_get);
router.post("/", room_controller.rooms_post);

router.get("/:id", room_controller.rooms_get_one);
router.put("/:id", room_controller.rooms_put);
router.delete("/:id", room_controller.rooms_delete);

module.exports = router;
