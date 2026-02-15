import mongoose, { Schema, Document } from "mongoose";

export interface IColumn extends Document {
  name: string;
  project: mongoose.Types.ObjectId;
  order: number; // column position
}

const columnSchema = new Schema<IColumn>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IColumn>("Column", columnSchema);
