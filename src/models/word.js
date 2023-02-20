import mongoose from "mongoose";
import slug from "mongoose-slug-generator";
import mongooseDelete from "mongoose-delete";

const Schema = mongoose.Schema;

const wordSchema = new Schema(
    {
        word: { type: String, required: true },
        mean: { type: String, required: true},
        description: { type: String },
        imgSrc: { type: String },
        priority: { type: Number, default: 1 },
        userId: { type: Schema.Types.ObjectId, ref: 'user', required: true }
    },
    {
        timestamps: true,
    }
)

export default mongoose.model('words', wordSchema);
