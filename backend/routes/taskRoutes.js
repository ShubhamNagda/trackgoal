import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  movePendingTasks,
  getProgress,
  shareTask,
} from "../controllers/taskController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.route("/").post(createTask).get(getTasks);
router.route("/:id").put(updateTask).delete(deleteTask);
router.post("/move-pending", movePendingTasks);
router.get("/progress", getProgress);
router.post("/:id/share", shareTask);

export default router;
