// src/services/paymongo.service.js
import Transaction from "../models/transaction.model.js";

export const handlePaymongoEvent = async (event) => {
  const { type, data } = event;

  switch (type) {
    case "payment.paid":
      await markTransactionSuccess(data);
      break;
    case "payment.failed":
      await markTransactionFailed(data);
      break;
    case "payment.refunded":
      await markTransactionRefunded(data);
      break;
    default:
      console.log("Unhandled event type:", type);
  }
};

const markTransactionSuccess = async (data) => {
  const { id, attributes } = data;
  const metadata = attributes?.metadata || {};

  const transaction = await Transaction.findOne({ transactionRef: metadata.paymentId });
  if (transaction) {
    transaction.status = "success";
    transaction.verifiedByCashier = true;
    transaction.verifiedAt = new Date();
    transaction.gatewayResponse = data;
    await transaction.save();
  }
};

const markTransactionFailed = async (data) => {
  const metadata = data.attributes?.metadata || {};
  const transaction = await Transaction.findOne({ transactionRef: metadata.paymentId });
  if (transaction) {
    transaction.status = "failed";
    transaction.gatewayResponse = data;
    await transaction.save();
  }
};

const markTransactionRefunded = async (data) => {
  const metadata = data.attributes?.metadata || {};
  const transaction = await Transaction.findOne({ transactionRef: metadata.paymentId });
  if (transaction) {
    transaction.status = "refunded";
    transaction.gatewayResponse = data;
    await transaction.save();
  }
};
