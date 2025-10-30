
import { Router } from "express";
import { authenticateToken as isAuthenticated } from "../authService";
import { storage } from "../storage";
import { insertPaymentSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { cryptoProcessorService } from "../cryptoProcessorService";

const router = Router();

// Payment routes
router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const payments = await storage.getPaymentsByUserId(userId);
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validate payment data WITHOUT userId (server-side only)
    const validation = insertPaymentSchema.omit({ userId: true }).safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid payment data", 
        error: fromError(validation.error).toString() 
      });
    }

    // Merge validated data with server-side userId
    const payment = await storage.createPayment({
      ...validation.data,
      userId,
    });
    res.json(payment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Failed to create payment" });
  }
});

// Crypto payment processor routes
router.post("/crypto/create", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { processor, amount, currency } = req.body;

    const invoice = await cryptoProcessorService.createPayment(
      processor,
      amount,
      currency,
      userId
    );

    const payment = await storage.createCryptoPayment({
      userId,
      processor,
      processorInvoiceId: invoice.invoiceId,
      amount: invoice.amount,
      currency: invoice.currency,
      fiatAmount: amount.toString(),
      fiatCurrency: "usd",
      status: invoice.status,
      paymentUrl: invoice.paymentUrl,
      qrCode: invoice.qrCode,
      expiresAt: invoice.expiresAt,
      metadata: {},
    });

    res.json({ payment, invoice });
  } catch (error: any) {
    console.error("Error creating crypto payment:", error);
    res.status(500).json({ message: error.message || "Failed to create crypto payment" });
  }
});

router.get("/crypto", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const payments = await storage.getCryptoPaymentsByUserId(userId);
    res.json(payments);
  } catch (error) {
    console.error("Error fetching crypto payments:", error);
    res.status(500).json({ message: "Failed to fetch crypto payments" });
  }
});

export default router;
