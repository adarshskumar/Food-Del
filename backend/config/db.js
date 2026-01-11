import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://adarsh:Adarsh123@cluster0.ywvb7lg.mongodb.net/food-del').then(() => console.log("DB Connected"));
}