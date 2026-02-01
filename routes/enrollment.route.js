import { Router } from "express";
import { 
    createEnrollment, 
    getAllEnrollments,
    getEnrollmentById,
    updateEnrollmentStatus,
    deleteEnrollment, 
    getStudentEnrollments,
    getEnrollmentsByStudentId
} from "../controllers/enrollment.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Student only
router.get('/my', authMiddleware(['student']), getStudentEnrollments);

// Admin only
router.post("/", authMiddleware(['admin']), createEnrollment);
router.get('/', authMiddleware(['admin']), getAllEnrollments);

router.get('/student/:studentId', authMiddleware(['admin']), getEnrollmentsByStudentId);

router.get('/:enrollmentId', authMiddleware(['admin']), getEnrollmentById);
router.patch('/:enrollmentId/status', authMiddleware(['admin']), updateEnrollmentStatus);
router.delete('/:enrollmentId', authMiddleware(['admin']), deleteEnrollment);





export default router;