import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  timezone: string;
  theme: "light" | "dark" | "system";
  notifications: {
    daily: boolean;
    streaks: boolean;
    goals: boolean;
    weekly: boolean;
  };
  privacy: {
    shareProfile: boolean;
    showActivity: boolean;
  };
  updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    name: { type: String, trim: true, maxlength: 80, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    timezone: { type: String, default: "Asia/Kolkata" },
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    notifications: {
      daily:   { type: Boolean, default: true  },
      streaks: { type: Boolean, default: true  },
      goals:   { type: Boolean, default: false },
      weekly:  { type: Boolean, default: true  },
    },
    privacy: {
      shareProfile: { type: Boolean, default: false },
      showActivity: { type: Boolean, default: true  },
    },
  },
  { timestamps: true }
);

const UserSettings: Model<IUserSettings> =
  mongoose.models.UserSettings ??
  mongoose.model<IUserSettings>("UserSettings", UserSettingsSchema);

export default UserSettings;