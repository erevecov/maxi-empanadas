import mongoose from 'mongoose'
import dotEnv from 'dotenv'

dotEnv.config()

try {
    mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })

} catch (error) {
    console.log(error)
}


export default mongoose