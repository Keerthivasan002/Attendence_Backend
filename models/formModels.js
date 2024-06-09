import mongoose from "mongoose";

const LeaveRequest = mongoose.Schema({
    UserId:{
        type: mongoose.Schema.Types.ObjectId,
    },
    reason:{
        type:String
    },
    subject:{
        type:Number
    },
    from:{
        type:Date
    },
    to:{
        type:Date
    },
    email:{
        type:String
    },
    status:{
        type:Number,
        default:0
    },
    message:{
        type:String,
        default:"PENDING FOR APPROVAL"
    }
},{
    timestamps:true,
    versionKey:false
})

export default mongoose.model("LeaveRequest",LeaveRequest)