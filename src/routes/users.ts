import express,{Router} from 'express';
import { encodeUrl, redirect } from "../controllers/users";

const router = Router();

router.use(express.json())

router.post('/postUrl',encodeUrl);
router.get('/redirect',redirect)


export default router;