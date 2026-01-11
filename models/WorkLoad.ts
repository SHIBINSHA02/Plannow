import mongoose ,{Schema,model,models} from 'mongoose'
const WorkLoad = new Schema(
    {
        organisatonId:{
            type:String,
            required :true
        },
        classroomId :{
            type:String,
            required :true
        },
        teacherId:{
            type:String,
            required:true
        },
        day:{
            type: Number,
            required:true
        },
        period:{
            type:Number,
            required:true
        },
        workLoad:{
            type:Number,
            default:0
        }
        
    },
    {timestamps:true}
)