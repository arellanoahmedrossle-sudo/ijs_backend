// src/routes/webhook.routes.js
import { Router } from "express";
import { paymongoWebhook } from "../controllers/webhook.controller.js";

const router = Router();

// No auth middleware here — PayMongo must reach it publicly
router.post("/paymongo", paymongoWebhook);

export default router;
