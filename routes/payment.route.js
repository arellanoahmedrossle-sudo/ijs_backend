import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    getStudentPayments,
    getStudentPaymentsById
} from '../controllers/payment.controller.js';


const router = Router();

// Student only
router.get('/my', authMiddleware(['student']), getStudentPayments);

// Admin only
router.post('/', authMiddleware(['admin']), createPayment);
router.get('/', authMiddleware(['admin', 'cashier']), getAllPayments);
router.get('/student/:studentId', authMiddleware(['admin', 'cashier']), getStudentPaymentsById);

router.get('/:paymentId', authMiddleware(['admin', 'cashier']), getPaymentById);
router.patch('/:paymentId', authMiddleware(['admin']), updatePayment);
router.delete('/:paymentId', authMiddleware(['admin']), deletePayment);

export default router;