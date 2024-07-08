import mongoose from "mongoose";

export const dbConnection =() => {
    mongoose.connect(process.env.MONGO_URI,{
        dbName:  "MERN_STACK_HOSPITAL_MANAGEMENT_SYSTEM_DEPLOYED"
    }).then(()=>{
        console.log("Database connected successfully");
    })  
    .catch((err)=>{
        console.log(`some error occured while connecting to databse: ${err}`);
    })  
}
