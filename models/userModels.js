import mongoose from "mongoose"

const userModels = mongoose.Schema({
    name: {
        type: String
    },
    age: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    role:{
        type:Number,
        default:1
    },
    position: {
        type: String
    },
    dob:{
        type: Date
    },
    otp:{
        type:String,
        default:" "
    }
});

export default mongoose.model("userModel",userModels)