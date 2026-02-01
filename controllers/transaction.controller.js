import Transaction from "../models/transaction.model.js";
import Payment from "../models/payment.model.js";
import Student from "../models/student.model.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ✅ Helper: update payment status based on successful transactions
const updatePaymentStatus = async (paymentId) => {
  const payment = await Payment.findById(paymentId).populate("transactions");

  if (!payment) return;

  // Sum all successful transactions
  const totalPaid = payment.transactions
    .filter(txn => txn.status === "success")
    .reduce((sum, txn) => sum + txn.amountPaid, 0);

  // If totalPaid >= totalAmount, mark payment completed
  if (totalPaid >= payment.totalAmount) {
    payment.status = "completed";
    await payment.save();
    
    return true;
  }

  return false;
};


const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY;
const authHeader = {
  Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET + ":").toString("base64")}`,
  "Content-Type": "application/json",
};

// ✅ Record a transaction (cash or online)
export const recordTransaction = async (req, res) => {
  try {
    const { paymentId, studentId, amountPaid, paymentMethod, source } = req.body;

    const payment = await Payment.findById(paymentId);
    const student = await Student.findById(studentId);
    if (!payment || !student) {
      return res.status(404).json({ success: false, message: "Payment or student not found" });
    }

    const transactionRef = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transaction = new Transaction({
      payment: paymentId,
      student: studentId,
      staff: req.user?.id,
      amountPaid,
      paymentMethod,
      source,
      transactionRef,
      status: paymentMethod === "cash" ? "success" : "pendingVerification",
      verifiedByCashier: paymentMethod === "cash", 
      verifiedAt: paymentMethod === "cash" ? new Date() : null,
    });

    await transaction.save();

    // ✅ Always tag transaction inside payment
    payment.transactions.push(transaction._id);
    await payment.save();

    // ✅ Update payment status immediately (for cash)
    let completed = await updatePaymentStatus(payment._id);

    let qrImage = null;

    if (paymentMethod === "online") {
      // Step 1: Create Payment Intent
      const intentRes = await axios.post(
        "https://api.paymongo.com/v1/payment_intents",
        {
          data: {
            attributes: {
              amount: amountPaid * 100,
              currency: "PHP",
              payment_method_allowed: ["qrph"],
              description: `Payment for ${student.firstName} ${student.lastName}`,
              statement_descriptor: "School Tuition",
              metadata: {
                studentId: student._id.toString(),
                cashierId: req.user.id,
                paymentId: payment._id.toString(),
                transactionId: transaction._id.toString(),
              },
            },
          },
        },
        { headers: authHeader }
      );

      const paymentIntent = intentRes.data.data;
      const clientKey = paymentIntent.attributes.client_key;

      // Step 2: Create QR Ph Payment Method
      const pmRes = await axios.post(
        "https://api.paymongo.com/v1/payment_methods",
        {
          data: {
            attributes: {
              type: "qrph",
              billing: {
                name: `${student.firstName} ${student.lastName}`,
                email: student.email,
                phone: student.phone || "",
              },
              metadata: {
                studentId: student._id.toString(),
                cashierId: req.user.id,
                paymentId: payment._id.toString(),
                transactionId: transaction._id.toString(),
              },
            },
          },
        },
        { headers: authHeader }
      );

      const paymentMethod = pmRes.data.data;

      // Step 3: Attach Payment Method to Payment Intent
      const attachRes = await axios.post(
        `https://api.paymongo.com/v1/payment_intents/${paymentIntent.id}/attach`,
        {
          data: {
            attributes: {
              payment_method: paymentMethod.id,
              client_key: clientKey,
            },
          },
        },
        { headers: authHeader }
      );

      const nextAction = attachRes.data.data.attributes.next_action;

      // ✅ Update transaction with gateway response
      transaction.transactionRef = paymentIntent.id;
      transaction.gatewayResponse = attachRes.data;
      transaction.status = "pendingVerification";
      await transaction.save();

      // ✅ Recalculate payment status (still pendingVerification, but keeps logic consistent)
      completed = await updatePaymentStatus(payment._id);

      qrImage = nextAction?.code?.image_url;
    }

    res.status(201).json({ success: true, transaction, qrImage, completedPayment: completed });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Verify transaction against PayMongo
export const verifyTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId).populate("student payment");

    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

    // Call PayMongo API to check status
    const paymongoRes = await axios.get(
      `https://api.paymongo.com/v1/payment_intents/${transaction.transactionRef}`,
      { headers: authHeader }
    );

    const status = paymongoRes.data?.data?.attributes?.status;

    transaction.gatewayResponse = paymongoRes.data;
    transaction.verifiedByCashier = true;
    transaction.verifiedAt = new Date();
    transaction.status = status === "succeeded" ? "success" : "failed";

    await transaction.save();

    const completed = await updatePaymentStatus(transaction.payment);

    res.json({ success: true, transaction, paymentCompleted: completed });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("student", "studentNo firstName lastName")
      .populate("payment", "status totalAmount schoolYear")
      .populate("staff", "fullName role");
    res.json({ success: true, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId)
      .populate("student", "studentNo firstName lastName")
      .populate("payment", "status totalAmount tuitionFee miscFees");

    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

    res.json({ success: true, transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Check transaction status without failing if not yet successful
export const checkTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Call PayMongo API to check status of the attached Payment Intent
    const paymongoRes = await axios.get(
      `https://api.paymongo.com/v1/payment_intents/${transaction.transactionRef}`,
      { headers: authHeader }
    );

    const status = paymongoRes.data?.data?.attributes?.status;
    let completed = false;
    // ✅ Update only if succeeded
    if (status === "succeeded") {
      transaction.status = "success";
      transaction.gatewayResponse = paymongoRes.data;
      transaction.verifiedByCashier = true;
      transaction.verifiedAt = new Date();
      await transaction.save();

      completed = await updatePaymentStatus(transaction.payment);
    }

    // ✅ Return current status (but don’t fail if not succeeded yet)
    return res.json({
      success: true,
      transactionId: transaction._id,
      transactionRef: transaction.transactionRef,
      currentStatus: status,
      appStatus: transaction.status, // "success" or still "pendingVerification"
      paymentCompleted: completed
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Get transaction summary for cashier dashboard
export const getTransactionSummary = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const transactionsToday = await Transaction.countDocuments({
      createdAt: { $gte: startOfDay },
      status: "success"
    });

    const amountCollectedAgg = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, status: "success" } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);
    const amountCollected = amountCollectedAgg[0]?.total || 0;

    const pendingPayments = await Payment.countDocuments({ status: "pending" });
    const completedPayments = await Payment.countDocuments({ status: "completed" });

    res.json({
      success: true,
      summary: {
        transactionsToday,
        amountCollected,
        pendingPayments,
        completedPayments
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Get recent transactions (limit configurable, default 5)
export const getRecentTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const transactions = await Transaction.find({ status: "success" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("student", "firstName lastName")
      .populate("payment", "schoolYear")
      .populate("staff", "fullName role");

    res.json({ success: true, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

