import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  emoji: string;
  color: string;
  streak: number;
  longestStreak: number;
  completedDates: Date[];
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Habit name is required"],
      trim: true,
    },
    emoji: {
      type: String,
      default: "✅",
    },
    color: {
      type: String,
      default: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    completedDates: {
      type: [Date],
      default: [],
    },
  },
  { timestamps: true }
);

const Habit: Model<IHabit> =
  mongoose.models.Habit ?? mongoose.model<IHabit>("Habit", HabitSchema);

export default Habit;