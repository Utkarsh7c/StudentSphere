import app from './app.js'
import { config } from 'dotenv';
import connectionToDb from './config/dbConnection.js';
import cloudinary from 'cloudinary'

config();
//const app= require('./app');

const PORT=  process.env.PORT
// cloudinary configuration 
cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
    
})


app.listen(PORT,async()=>{
    await connectionToDb(); // database conneection while server up
console.log(`app is runnning at http:localhost:${  PORT}`)
})