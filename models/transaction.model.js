import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, // optional if source=qrph

  amountPaid: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['online', 'cash'], default: 'online' },
  transactionRef: { type: String, unique: true },

  source: { type: String, enum: ['cashier', 'qrph'], required: true },
  verifiedByCashier: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  gatewayResponse: { type: Object },

  status: { type: String, enum: ['pendingVerification', 'success', 'failed', 'refunded'], default: 'pendingVerification' },
  transactionDate: { type: Date, default: Date.now }
}, { timestamps: true });


const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;