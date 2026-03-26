import mongoose, { Schema, Document, Model } from "mongoose";

const ALLOWED_CATEGORIES = ["Fitness", "Learning", "Wellness", "Health", "Mindfulness", "Nutrition"] as const;
type HabitCategory = (typeof ALLOWED_CATEGORIES)[number];

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  emoji: string;
  color: string;
  category: HabitCategory;
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
      maxlength: [40, "Habit name cannot exceed 40 characters"],
    },
    emoji: {
      type: String,
      default: "🎯",
    },
    color: {
      type: String,
      default: "bg-orange-50 dark:bg-orange-900/20",
    },
    category: {
      type: String,
      enum: ALLOWED_CATEGORIES,
      default: "Health",
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
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