import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { 
    recordTransaction,
    verifyTransaction,
    getAllTransactions,
    getTransactionById,
    checkTransactionStatus,
    getTransactionSummary,
    getRecentTransactions,
    studentPayOnline,
    studentCheckTransactionStatus,
    getTransactionQr
 } from "../controllers/transaction.controller.js";


 const router = Router();

 router.post('/', authMiddleware(['admin', 'cashier']),recordTransaction);
 router.patch('/:transactionId/verify', authMiddleware(['cashier']), verifyTransaction);

 router.get("/:transactionId/status", checkTransactionStatus);

 router.get("/summary", getTransactionSummary); 
 router.get("/recent", getRecentTransactions);

 router.get('/', authMiddleware(['admin', 'cashier', 'student']), getAllTransactions);
 router.get('/id/:transactionId', authMiddleware(['admin', 'cashier', 'student']), getTransactionById);

 router.post('/online', authMiddleware(['student']), studentPayOnline);
 router.get('/:transactionId/student-status', authMiddleware(['student']), studentCheckTransactionStatus);
 router.get('/:transactionId/qr', authMiddleware(['student']), getTransactionQr);


 export default router;
