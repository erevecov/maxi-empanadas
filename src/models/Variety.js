import mongoose from 'mongoose'

const Schema = mongoose.Schema

const varietySchema = new Schema({
    name: {  type: String, required: true },
    status: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Products' },
    createdAt: { type: Date, default: Date.now()}
}, {
    versionKey: false
})

const Variety = mongoose.model('Varieties', varietySchema)

export default Variety