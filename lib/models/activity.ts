import mongoose, { Schema, Document, Model } from "mongoose";

export type ActivityType =
  | "habit_complete"
  | "streak"
  | "goal_milestone"
  | "achievement"
  | "progress";

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["habit_complete", "streak", "goal_milestone", "achievement", "progress"],
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
  },
  { timestamps: true }
);

const Activity: Model<IActivity> =
  mongoose.models.Activity ??
  mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;