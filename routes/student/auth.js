import { Router } from 'express';
import { handleRegister, handleLogin, handleChangePassword } from '../../controllers/student/auth.controller.js'
import { authMiddleware } from '../../middleware/auth.js';
const router = Router();


// REGISTER route
router.post('/register', handleRegister);


// LOGIN route
router.post('/login', handleLogin);

router.post('/change-password', authMiddleware(['student']), handleChangePassword);
export default router;
