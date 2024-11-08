import cookieParser from "cookie-parser";
import express  from "express";
import cors from 'cors';
import morgan from "morgan";
import userRoutes from '..//Server/routes/user.routes.js'

const app = express();
app.use(express.json());
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials:true
}))
app.use(cookieParser());
app.use(morgan('dev'));   // for security purpose to know info like : GET /favicon.ico 404 1.720 ms - 25
// all routes 
// user :
app.use('/api/studentsphere/user',userRoutes);

// announcements //news 
// payemnt // fees 


app.use('/ping',function(req,res){
    res.status(404).send('pong');
})
// random route hit;
app.use('*',(req,res)=>{
    res.status(404).send('Oops!! 404 page not found');
})
export default app;