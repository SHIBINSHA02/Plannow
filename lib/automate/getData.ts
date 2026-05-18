import Organisation from "@/models/Organisation";
import Teacher from "@/models/Teacher";
import Classroom from "@/models/Classroom";
import TeacherWorkload from "@/models/TeacherWorkload";
import ScheduleSlot from "@/models/ScheduleSlot";
import { strict } from "assert";
import { connectDB } from "../db";

connectDB();
//get classroom shedule  
export async function getSchedule(organisationId:string ,classroom: string) {
    try{
        const classroomSchedule = await ScheduleSlot.find({
            organisationId :organisationId,
            classroomId : classroom
    })
        return classroomSchedule;
    }
    catch(error){
        console.error("Failed to fetch classroom schedule:", error);
        throw error;

    }
}
//get teacher schedule


// get ratio each subject and periods left


//get decending order of completion


//look for before slt of classroom and before and after slot of teacher 
//rearange priority accordingly



//


async function runTest() {
    try {
       
        const orgId = "65c32b2f9b1d8b2bad7f1011";
        const classId = "65c32b2f9b1d8b2bad7f1022";

        console.log("Fetching schedule from database...");

        const schedule = await getSchedule(orgId, classId);

    
        console.log("--- Classroom Schedule Result ---");
        console.log(schedule);

    } catch (error) {
        console.error("Test execution failed:", error);
    } finally {
        
    }
}

// Execute the runner script
runTest();
