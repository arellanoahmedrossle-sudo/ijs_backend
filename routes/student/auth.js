import { Router } from 'express';
import { handleRegister, handleLogin } from '../../controllers/student/auth.controller.js'

const router = Router();


// REGISTER route
router.post('/register', handleRegister);


// LOGIN route
router.post('/login', handleLogin);


export default router;