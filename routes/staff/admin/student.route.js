import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.js';
import {
    getAllStudents,
    getStudentById,
    updateStudentGradePlacement,
    updateStudentDiscount,
    deleteStudent
} from '../../../controllers/staff/admin/student.controller.js';


const router = Router();

router.get('/', authMiddleware(['admin', 'cashier']), getAllStudents);
router.get('/:studentId', authMiddleware(['admin']), getStudentById);

router.patch('/:studentId/gradePlacement', authMiddleware(['admin']), updateStudentGradePlacement);
router.patch('/:studentId/discountApplied', authMiddleware(['admin']), updateStudentDiscount);
router.delete('/:studentId', authMiddleware(['admin']), deleteStudent);

export default router;