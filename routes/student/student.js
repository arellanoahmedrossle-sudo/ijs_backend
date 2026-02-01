import { Router } from "express";
import { authMiddleware } from '../../middleware/auth.js';
import { 
    getStudentProfile, 
    updateStudentProfile, 
    deleteStudentAccount 
} from "../../controllers/student/student.controller.js";

const router = Router();

// GET student profile (self)
router.get('/me', authMiddleware(['student']), getStudentProfile);

// PUT update student profile (self)
router.put('/me', authMiddleware(['student']), updateStudentProfile);

// DELETE student account (self)
router.delete('/me', authMiddleware(['student']), deleteStudentAccount);

export default router;