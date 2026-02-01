import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './utils/db.js';

import staffAuthRoutes from './routes/staff/auth.js';
import studentAuthRoutes from './routes/student/auth.js';
import studentRoutes from './routes/student/student.js';
import enrollmentRoutes from './routes/enrollment.route.js';
import adminStudentRoutes from './routes/staff/admin/student.route.js';
import paymentRoutes from './routes/payment.route.js';
import transactionRoutes from './routes/transaction.route.js';
import webhookRoutes from './routes/webhook.route.js'

dotenv.config();
await connectDB();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:5174',
        'https://ijs-phi.vercel.app'
    ],
    credentials: true,
}))

// Routes
app.use('/api/staff/auth', staffAuthRoutes);
app.use('/api/student/auth', studentAuthRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin/students', adminStudentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/webhooks', webhookRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Server is live' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server is running at: http://localhost:${PORT}/`));
