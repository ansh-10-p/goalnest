import mongoose, { Schema, Document, Model } from "mongoose";

const ALLOWED_PRIORITIES = ["critical", "high", "medium", "low"] as const;
const ALLOWED_CATEGORIES = ["Career", "Health", "Finance", "Learning", "Personal", "Creative"] as const;

export interface IMilestone {
  _id: mongoose.Types.ObjectId;
  text: string;
  done: boolean;
}

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: (typeof ALLOWED_CATEGORIES)[number];
  priority: (typeof ALLOWED_PRIORITIES)[number];
  deadline: Date;
  milestones: IMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    text: { type: String, required: true, trim: true, maxlength: 100 },
    done: { type: Boolean, default: false },
  },
  { _id: true }
);

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 80 },
    description: { type: String, default: "", trim: true, maxlength: 200 },
    category: { type: String, enum: ALLOWED_CATEGORIES, default: "Career" },
    priority: { type: String, enum: ALLOWED_PRIORITIES, default: "medium" },
    deadline: { type: Date, required: [true, "Deadline is required"] },
    milestones: { type: [MilestoneSchema], default: [] },
  },
  { timestamps: true }
);

const Goal: Model<IGoal> =
  mongoose.models.Goal ?? mongoose.model<IGoal>("Goal", GoalSchema);

export default Goal;