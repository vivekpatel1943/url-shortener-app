import express from 'express';
import { prisma } from './utils/prisma';
import router from './routes/users';
import cors from 'cors';

const app = express();

// middlewares
app.use(express.json());
// enable cors here
app.use(cors({
    origin: ["http://3.111.246.79:3000"],
    credentials: true
}))

app.use('/api/v1', router);

app.get('/', (req, res) => {
    return res.status(200).json({ msg: "your server is healthy.." })
})

async function databaseConnect() {
    let retries = 5;
    while (retries) {
        try {
            await prisma.$connect();
            console.log("database connected successfully..")
            break;
        } catch (err) {
            retries--;
            console.error("error connecting to the database", err);
        }
    }
}

databaseConnect();

const port = 3005;

app.listen(port, () => {
    console.log("your server is running on port", port, ".");
})