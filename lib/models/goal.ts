import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  percentage: number;
  deadline: Date;
  category: string;
  color: "indigo" | "violet" | "emerald" | "amber";
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    color: {
      type: String,
      enum: ["indigo", "violet", "emerald", "amber"],
      default: "indigo",
    },
  },
  { timestamps: true }
);

const Goal: Model<IGoal> =
  mongoose.models.Goal ?? mongoose.model<IGoal>("Goal", GoalSchema);

export default Goal;