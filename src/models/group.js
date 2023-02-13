import mongoose from "mongoose";
import slug from "mongoose-slug-generator";
import mongooseDelete from "mongoose-delete";

const Schema = mongoose.Schema;

const groupSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        avatarImg: { type: String },
        adminId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
        baseMoney: {type: Number, default: 0},
        slug: { type: String, slug: "name", unique: true },
    },
    {
        timestamps: true,
    }
)

mongoose.plugin(slug);
mongoose.plugin(mongooseDelete, {overrideMethods: 'all'})

export default mongoose.model('group', groupSchema);
