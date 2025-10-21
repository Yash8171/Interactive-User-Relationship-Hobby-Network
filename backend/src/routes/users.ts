import express from "express";
import * as ctrl from "../controllers/usersController";
const router = express.Router();

router.get("/users", ctrl.getUsers);
router.post("/users", ctrl.createUser);
router.put("/users/:id", ctrl.updateUser);
router.delete("/users/:id", ctrl.deleteUser);
router.post("/users/:id/link", ctrl.linkUser);
router.delete("/users/:id/unlink", ctrl.unlinkUser);
router.get("/graph", ctrl.getGraph);

export default router;
