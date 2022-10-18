import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname: { type: String },
    username: { type: String, unique: true, required: true, unique: true},
    password: { type: String, isRequired: true },
    isAdmin: { type: Boolean, default: false },
    email: { type: String, unique: true, required: true, unique: true },
}, { timestamps: true })

mongoose.plugin(mongooseDelete, {overrideMethods: 'all'})

export default mongoose.model('user', userSchema);