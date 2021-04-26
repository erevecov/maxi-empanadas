import mongoose from 'mongoose'

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: { type: String },
    username: { type: String },
    scope: { type: String, required: true },
    status: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now()}
}, {
    versionKey: false
})

const User = mongoose.model('Users', userSchema)

export default User