import mongoose from "mongoose";

const dbConnection = async()=>{
    try {
        const connect = await mongoose.connect(process.env.Mongo_URI);
        console.log(`Mongoose Connected at ${connect.connection.host}`)
        
    } catch (error) {
        console.log(`Error,${error.message}`);
        process.exit(1);
    }
}

export default dbConnection;