import Payment from '../models/payment.model.js';
import Student from '../models/student.model.js';
import Enrollment from '../models/enrollment.model.js';
import Transaction from '../models/transaction.model.js';



export const createPayment = async (req, res) => {
    try {
        const {
            studentId,
            enrollmentId,
            tuitionFee,
            discountApplied,
            miscFees,
            dueDate,
            schoolYear
        } = req.body;

        // Validate student
        const student = await Student.findById(studentId);  
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

        const payment = new Payment({
            student: studentId,
            enrollment: enrollmentId,
            tuitionFee,
            discountApplied,
            miscFees,
            dueDate,
            schoolYear,
            staff: req.user.id
        });

        await payment.save();

        res.status(201).json({ success: true, payment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}


export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('student', 'studentNo firstName lastName email')
            .populate('enrollment', 'schoolYear gradeLevel section program status semester')
            .populate('staff', 'fullName role') 
            .populate('transactions', 'amountPaid status')
            .lean();
        
        res.json({ success: true, payments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message })
    }
}


export const getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findById(paymentId)
            .populate('student', 'studentNo firstName lastName email')
            .populate('enrollment', 'schoolYear gradeLevel section program status')
            .populate('staff', 'fullName role')
            .populate('transactions')
            .lean();

        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

        res.json({ success: true, payment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message })
    }
}


export const updatePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const updates = req.body;

        const payment = await Payment.findOneAndUpdate(
            { _id: paymentId },
            { $set: updates},
            { new: true, runValidators: true }
        )
            .populate('student', 'studentNo firstName lastName email')
            .populate('enrollment', 'schoolYear gradeLevel section program status')
            .populate('staff', 'fullName role');
        
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

        res.json({ success: true, payment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const deletePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findByIdAndDelete(paymentId);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

        res.json({ success: true, message: 'Payment deleted successfully' })
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}


export const getStudentPayments = async (req, res) => {
    try {
        const studentId = req.user.id;

        const payments = await Payment.find({ student: studentId })
            .populate('enrollment', 'schoolYear gradeLevel section program status semester')
            .populate('transactions', 'amountPaid status transactionDate paymentMethod transactionRef')
            .lean();
        
        res.json({ success: true, payments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const getStudentPaymentsById = async (req, res) => {
    try {
        const { studentId } = req.params;

        const payments = await Payment.find({ student: studentId })
            .populate('enrollment', 'schoolYear gradeLevel section program status semester')
            .populate('transactions', 'amountPaid status transactionDate')
            .lean();

        res.json({ success: true, payments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message })
    }
}

export const getPaymentsByEnrollmentId = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const payments = await Payment.find({ enrollment: enrollmentId })
      .populate('student', 'studentNo firstName lastName email')
      .populate('enrollment', 'schoolYear gradeLevel section program status semester')
      .populate('staff', 'fullName role')
      .populate('transactions')
      .lean();

    if (!payments || payments.length === 0) {
      return res.status(404).json({ success: false, message: 'No payments found for this enrollment' });
    }

    res.json({ success: true, payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
