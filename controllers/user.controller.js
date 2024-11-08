import AppError from "../utils/error.utils.js";
import User from "../models/user.modle.js"
import cloudinary from 'cloudinary';
import fs from'fs/promises';
const cookieOption={
    maxAge:7*24*60*60*1000,     // true
    httpOnly:true,
    secure:true
}
const register = async(req,res,next)=>{
const{fullName,email,password}=req.body;

if(!fullName||!password||!email){
    return  next(new AppError('All Field Are Required',400));
}
const userExist = await User.findOne({email});
if(userExist){
    return  next(new AppError('Email already exists',400));
}
const user= await User.create({
    fullName,
    email,
    password,
    avatar:{
        public_id:email,
        secure_URL:'https://res.cloudinary.com/du9jzlpt/image/upload/v1674647316/avatar'
    }
})
if(!user){
    return next(new AppError('Registration fails!,please try again later',400))
}
// todo: image upload 
console.log("file is ->",JSON.stringify(req.file))
if(req.file){
    console.log(req.file)
try{
const  result = await cloudinary.v2.uploader.upload(req.file.path,{
    folder:'lms',
    width:'250',
    height:'250',
    gravity:'faces',  // focuses more on face 
    crop:'fill'
});
console.log("Cloudinary result:", result);

if(result){
    user.avatar.public_id=result.public_id;
    user.avatar.secure_url=result.secure_url;
    // remove file 
    //fs.rm(`uploads/${req.file.filename}`)

}
}

catch (e) {
     console.error("Error during Cloudinary upload:", e);
     console.log("Cloudinary API error:", e && e.message, e && e.response && e.response.body);
    return next(new AppError(e||"file not uploaded, try again!", 500));
}

}
await user.save()
user.password=undefined;
const token=await user.generateJWTTOKEN();
res.cookie('token',token,cookieOption)  // *
 res.status(201).json({
    success:true,
    message:'User registered successfully',
    user,
 })

}
const login= async (req,res,next)=>{
    try{
        const {email,password}=req.body
        if(!email||!password){
        return next(new AppError('All fields are required',400));
        
        }
        const user =await User.findOne({email}).select('+password') // for explicitly 
        if(!user||!user.comparePassword(password)){
            return next(new AppError('Email or Password doesnot match',400))
        }
        const token=await user.generateJWTTOKEN();
        user.password=undefined;
        res.cookie('token',token,cookieOption);
        res.status(200).json({
         success:true,
         message:'User loggedIn successfully',
         user,
          
        })
    }
    catch(e){
        return next(new AppError(e.message,500))
    }

};
const logout=(req,res,next)=>{   // delete cookie to get logOut
try{
    res.cookie('token',null,{
        secure:true,
        maxAge:0,
        httpOnly:true,
    
    })
    res.status(200).json({
        sucess:true,
        message:'User logged Out successfully'
    })
}
catch(e){
return next(new AppError("inalif",400));
}
   
}
const getProfile= async (req,res,next)=>{
    try{
        const userId=req.user.id;
        const user=await  User.findById(userId)
        res.status(200).json({
success:true,
message:'User details',
user
        })
        
    }
    catch(e){
return next(new AppError('Failed to fetch user detail',400))
    }
};

const updateUser= async (req,res,next)=>{
    const{fullName} = req.body;
    const{id}=req.user;  // cleared that loggedIn user is there 
    const user=await User.findById(id);
    if(!user){
        return next(new AppError("User doesnot exists",400))
    } 
    if(fullName){
        user.fullName=fullName;
    }
    if(req.file){
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        try{
            const  result = await cloudinary.v2.uploader.upload(req.file.path,{
                folder:'lms',
                width:'250',
                height:'250',
                gravity:'faces',  // focuses more on face 
                crop:'fill'
            });
            console.log("Cloudinary result:", result);
            
            if(result){
                user.avatar.public_id=result.public_id;
                user.avatar.secure_url=result.secure_url;
                // remove file 
                fs.rm(`uploads/${req.file.filename}`)
            
            }
            }
            
            catch (e) {
                 console.error("Error during Cloudinary upload:", e);
                 console.log("Cloudinary API error:", e && e.message, e && e.response && e.response.body);
                return next(new AppError(e||"file not uploaded, try again!", 500));
            }
            
    }
    await user.save()
    res.status(200).json({
        success:true,
        message:'User profile updated successfully'
    })



}
export{
    register,
    login,
    logout,
    getProfile,
    updateUser
}