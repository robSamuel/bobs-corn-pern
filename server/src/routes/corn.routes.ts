import { Router, Request, Response } from "express";
import { cornLimiter } from "../rateLimiter";
import { getUserByIp, createUser, createPurchase, getUserPurchases, getUserPurchaseStats, getAllPurchases } from "../db/init";
import { getIO } from "../socket";

const router = Router();

// Helper function to get client IP address
function getClientIp(req: Request): string {
    return req.ip || req.socket.remoteAddress || 'unknown';
}

router.post("/buy", cornLimiter, async (req: Request, res: Response) => {
    try {
        const ipAddress = getClientIp(req);
        
        // Get or create user
        let user = await getUserByIp(ipAddress);
        if (!user) {
            user = await createUser(ipAddress);
        }
        
        // Create purchase
        const purchase = await createPurchase(user.id, 1);
        
        // Emit purchase event to all connected clients for real-time updates
        const io = getIO();
        io.emit('newPurchase', {
            id: purchase.id,
            userId: user.id,
            ipAddress: ipAddress,
            quantity: purchase.quantity,
            purchasedAt: purchase.purchased_at
        });
        
        return res.status(200).json({
            message: "You successfully bought corn 🌽",
            purchase: {
                id: purchase.id,
                purchasedAt: purchase.purchased_at
            }
        });
    } catch (error) {
        console.error('Error in /buy route:', error);
        return res.status(500).json({
            message: "Something went wrong while processing your purchase"
        });
    }
});

// Get current user's purchase history
router.get("/purchases", async (req: Request, res: Response) => {
    try {
        const ipAddress = getClientIp(req);
        
        const user = await getUserByIp(ipAddress);
        if (!user) {
            return res.status(200).json({
                purchases: [],
                stats: {
                    totalPurchases: 0,
                    totalQuantity: 0
                }
            });
        }
        
        // Get purchases and stats
        const purchases = await getUserPurchases(user.id, 50);
        const stats = await getUserPurchaseStats(user.id);
        
        return res.status(200).json({
            purchases: purchases.map(p => ({
                id: p.id,
                quantity: p.quantity,
                purchasedAt: p.purchased_at
            })),
            stats: {
                totalPurchases: parseInt(stats.total_purchases) || 0,
                totalQuantity: parseInt(stats.total_quantity) || 0,
                firstPurchase: stats.first_purchase,
                lastPurchase: stats.last_purchase
            }
        });
    } catch (error) {
        console.error('Error in /purchases route:', error);
        return res.status(500).json({
            message: "Something went wrong while fetching your purchases"
        });
    }
});

// Get all purchases
router.get("/purchases/all", async (req: Request, res: Response) => {
    try {
        const purchases = await getAllPurchases(100);
        
        return res.status(200).json({
            purchases: purchases.map(p => ({
                id: p.id,
                userId: p.user_id,
                ipAddress: p.ip_address,
                quantity: p.quantity,
                purchasedAt: p.purchased_at
            }))
        });
    } catch (error) {
        console.error('Error in /purchases/all route:', error);
        return res.status(500).json({
            message: "Something went wrong while fetching purchases"
        });
    }
});

export default router;

