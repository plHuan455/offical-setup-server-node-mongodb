import mongoose from "mongoose";

const Schema = mongoose.Schema;

const inviteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'group', required: true },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('invite', inviteSchema);
