import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    dueDate: {
      // stored as yyyy-mm-dd string for easy comparisons across "today/tomorrow"
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    sharedBy: {
      // if this task was shared to me by someone else, keep track
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
