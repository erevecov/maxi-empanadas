import mongoose from 'mongoose'

const Schema = mongoose.Schema

const productRegisterSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Products' },
    variety: { type: Schema.Types.ObjectId, ref: 'Varieties' },
    user: { type: Schema.Types.ObjectId, ref: 'Users' },
    qty: { type: Number, required: true },
    date: { type: String, required: true },
    advices: [
        {
            message: { type: String, required: true },
        }
    ],
    createdAt: { type: Date, default: Date.now() }
}, {
    versionKey: false
})

const ProductRegister = mongoose.model('ProductRegisters', productRegisterSchema)

export default ProductRegister