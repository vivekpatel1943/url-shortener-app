import express,{Router} from 'express';
import { postUrl } from "../controllers/users";

const router = Router();

router.use(express.json())

router.post('/postUrl',postUrl);


export default router;