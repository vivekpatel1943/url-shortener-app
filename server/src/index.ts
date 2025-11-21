import express from 'express';
import { prisma } from './utils/prisma';
import router from './routes/users';
import cors from 'cors';

const app = express();

// middlewares
app.use(express.json());
// enable cors here
app.use(cors({
    origin : ["http://localhost:5173"],
    credentials : true
}))
app.use('/api/v1',router);



async function databaseConnect(){
    try{
        await prisma.$connect();
        console.log("database connected successfully..")
    }catch(err){
        console.error("error connecting to the database",err);
    }
} 

databaseConnect();

const port = 3005;

app.listen(port,() => {
    console.log("your server is running on port", port, ".");
})