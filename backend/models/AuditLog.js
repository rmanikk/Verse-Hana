import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      default: "user",
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    previousValue: {
      type: String,
      default: "",
    },
    nextValue: {
      type: String,
      default: "",
    },
    targetName: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
