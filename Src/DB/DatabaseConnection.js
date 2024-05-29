import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const databaseConnection = mongoose.connect(process.env.DATABASE_CONNECTION)
                                   .then(()=>console.log("Database is connected successfully"))
                                   .catch((err)=> console.log("Database connection Error :::>", err.stack)) 