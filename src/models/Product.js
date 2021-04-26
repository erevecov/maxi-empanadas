import mongoose from 'mongoose'

const Schema = mongoose.Schema

const productSchema = new Schema({
    name: {  type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now()}
}, {
    versionKey: false
})

const Product = mongoose.model('Products', productSchema)

export default Product