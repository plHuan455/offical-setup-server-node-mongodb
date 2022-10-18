import mongoose from "mongoose";

const Schema = mongoose.Schema;

const pendingSchema = new Schema(
  {
    content: {type: String},
    bank: {type: String, required: true},
    date: {type: Date, required: true}, 
    money: {type: Number, required: true},
    groupId: {type: Schema.Types.ObjectId, required: true, ref: 'group'},
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('pending', pendingSchema);
