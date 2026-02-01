// src/controllers/webhook.controller.js
import { handlePaymongoEvent } from "../services/paymongo.service.js";

export const paymongoWebhook = async (req, res) => {
  try {
    const event = req.body;
    console.log("Webhook received:", event);

    await handlePaymongoEvent(event);

    res.sendStatus(200); // acknowledge receipt
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
