import mongoose from "mongoose";
const connectDB = async () => {
    try {
        console.log(process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI).then(() => {
            console.log("✅ database connected");
        }
        );
    } catch (error) {
        console.log("error database connected", error);

    }
}

export default connectDB;