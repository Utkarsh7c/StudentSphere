import bcrypt from 'bcryptjs'
import   jwt  from 'jsonwebtoken';
import { Schema,model } from "mongoose";
import crypto from 'crypto'
const userSchema=new Schema({
    fullName:{
        type:'String',
        required:[true,,'Name is required'],
        minLength:[5,'Name must at least 5 character '],
      maxLength:[50,'Name should be less than 50 characters '],
     lowercase:true,
      trim:true
    },
    email:{
        type:'String',
        required:[true,'Email is required'],
   lowercase:true,
   trim:true,
   unique:true
// match:[] for regex only    
    },
    password:{
        type:'String',
        required:[true,'passsword is required'],
        minLength:[8,'password must have atleast 8 charaters '],
        select:false
    },
    role:{
        type:'String',
        enum:['USER','ADMIN'],
        default:'USER'
    },
    avatar:{
        public_id:{
            type:'String',

        },
        secure_url:{
            type:'String'
        }
    },
    forgotPasswordToken:String,
     forgotPasswordExpiry:Date,
     subscription:{
        id:String,
        status:String,
     }
},
{
 timestamps:true
});
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
 return next();
    }
    this.password= await bcrypt.hash(this.password,10);

})
userSchema.methods={
    generateJWTTOKEN: async function(){
        return  await jwt.sign (
            {id:this._id,email:this.email,subscription:this.subscription,role:this.role},
            process.env.jwt_secret,
            // {
            //     expiry:'24h',
            // }
        )
    },
    comparePassword: async function(plainTextPassword){      
 return  await bcrypt.compare(plainTextPassword,this.password)
    },
    generatePasswordResetToken:async function  (){
        const resetToken=crypto.randomBytes(20).toString('hex');  // random token generated 
        this.forgotPasswordToken=crypto
        .createHash('sha256')  // encrypted 
        .update(resetToken)
        .digest('hex') // in hex format 
        this.forgotPasswordExpiry=Date.now()+15*60*1000;  // converted 15 mins to sec till+15minsnext expiry 
   return resetToken;
    }


}
const User=model('user',userSchema);
export default User;
