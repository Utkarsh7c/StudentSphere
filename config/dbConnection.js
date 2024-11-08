import mongoose from "mongoose";


mongoose.set('strictQuery',false); // donot run on strict mode 

const  connectionToDb= async ()=>{
    try{

        const {connection}= await  mongoose.connect(
            process.env.MONGO_URL
        )
        if(connection)
{
    console.log(`connected to mongoDb ${connection.host}`);
}

    }
    catch(e)
    {
console.log('error is ', e);
process.exit(1);
    }  
}
export default connectionToDb;