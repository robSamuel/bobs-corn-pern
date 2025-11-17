import { Router } from "express";
import { cornLimiter } from "../rateLimiter";
import { PurchaseController } from "../controllers/purchase.controller";

const router = Router();
const purchaseController = new PurchaseController();

router.post("/buy", cornLimiter, purchaseController.buyCorn);
router.get("/purchases", purchaseController.getUserPurchases);
router.get("/purchases/all", purchaseController.getAllPurchases);

export default router;

