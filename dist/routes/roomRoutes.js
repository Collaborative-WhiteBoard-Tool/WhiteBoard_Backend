"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const boardController_1 = require("../controllers/boardController");
const router = (0, express_1.Router)();
router.post("/createBoard", boardController_1.createBoard);
router.get("/board", boardController_1.getBoardData);
exports.default = router;
//# sourceMappingURL=roomRoutes.js.map