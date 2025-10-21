import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  age: number;
  hobbies: string[];
  friends: string[]; // array of user ids
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true },
  age: { type: Number, required: true },
  hobbies: { type: [String], required: true, default: [] },
  friends: { type: [String], required: true, default: [] },
  createdAt: { type: Date, default: () => new Date() }
});

export default mongoose.model<IUser>('User', UserSchema);
