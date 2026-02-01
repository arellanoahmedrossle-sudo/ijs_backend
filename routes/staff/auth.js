import { Router } from 'express';
import { registerStaff, loginStaff } from '../../controllers/staff/auth.controller.js';

const router = Router();

// Register
router.post('/register', registerStaff);

// Login
router.post('/login', loginStaff);


export default router;