import mongoose from "mongoose";

const vacancyBreakdownSchema = new mongoose.Schema(
  {
    GEN: { type: Number, default: 0 },
    OBC: { type: Number, default: 0 },
    SC:  { type: Number, default: 0 },
    ST:  { type: Number, default: 0 },
    EWS: { type: Number, default: 0 },
    PH:  { type: Number, default: 0 },
  },
  { _id: false },
);

const advertisementSchema = new mongoose.Schema(
  {
    advtNo:       { type: String, required: true, trim: true },
    postTitle:    { type: String, required: true, trim: true },
    postTitleGu:  { type: String, trim: true, default: "" },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    postClass:    { type: String, trim: true, default: "" },
    payScale:     { type: String, trim: true, default: "" },
    vacancies:    { type: Number, required: true, min: 1 },
    vacancyBreakdown: { type: vacancyBreakdownSchema, default: () => ({}) },
    ageLimit:           { type: String, trim: true, default: "" },
    eduQualification:   { type: String, trim: true, default: "" },
    phDescription:      { type: String, trim: true, default: "" },
    experienceRequired: { type: String, trim: true, default: "" },
    probationPeriod:    { type: String, trim: true, default: "" },
    otherConditions:    { type: String, trim: true, default: "" },
    applicationFee: { type: Number, required: true, min: 0 },
    startDate:      { type: Date, required: true },
    endDate:        { type: Date, required: true },
    pdfPath:        { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published", "closed", "archived"],
      default: "draft",
    },
    tenantId:  { type: String, required: true, index: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

advertisementSchema.index({ advtNo: 1, tenantId: 1 }, { unique: true });

export default mongoose.model("Advertisement", advertisementSchema);
