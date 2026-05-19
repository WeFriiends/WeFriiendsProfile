import mongoose, { Document, Schema } from "mongoose";

export type ReportReason =
  | "spam"
  | "abuse"
  | "inappropriate-photos"
  | "other";

export interface ReportDocument extends Document {
  reportedUserId: string;
  reporterUserId: string;
  reason: ReportReason;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<ReportDocument>(
  {
    reportedUserId: { type: String, required: true, index: true },
    reporterUserId: { type: String, required: true },
    reason: {
      type: String,
      enum: ["spam", "abuse", "inappropriate-photos", "other"],
      required: true,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model<ReportDocument>("Report", reportSchema);

export default Report;
