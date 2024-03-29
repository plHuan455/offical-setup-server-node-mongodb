import mongoose from "mongoose";

const Schema = mongoose.Schema;

const memberSchema = new Schema({
    groupId: { type: mongoose.Types.ObjectId, ref: 'group', required: true },
    userId: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    isAdmin: { type: Boolean, default: true},
}, {
    timestamps: true
})

export default mongoose.model('member', memberSchema);