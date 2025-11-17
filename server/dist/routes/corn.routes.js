"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rateLimiter_1 = require("../rateLimiter");
const init_1 = require("../db/init");
const socket_1 = require("../socket");
const router = (0, express_1.Router)();
// Helper function to get client IP address
function getClientIp(req) {
    return req.ip || req.socket.remoteAddress || 'unknown';
}
router.post("/buy", rateLimiter_1.cornLimiter, async (req, res) => {
    try {
        const ipAddress = getClientIp(req);
        // Get or create user
        let user = await (0, init_1.getUserByIp)(ipAddress);
        if (!user) {
            user = await (0, init_1.createUser)(ipAddress);
        }
        // Create purchase
        const purchase = await (0, init_1.createPurchase)(user.id, 1);
        // Emit purchase event to all connected clients for real-time updates
        const io = (0, socket_1.getIO)();
        io.emit('newPurchase', {
            id: purchase.id,
            userId: user.id,
            ipAddress: ipAddress,
            quantity: purchase.quantity,
            purchasedAt: purchase.purchasedAt
        });
        return res.status(200).json({
            message: "You successfully bought corn 🌽",
            purchase: {
                id: purchase.id,
                purchasedAt: purchase.purchasedAt
            }
        });
    }
    catch (error) {
        console.error('Error in /buy route:', error);
        return res.status(500).json({
            message: "Something went wrong while processing your purchase"
        });
    }
});
// Get current user's purchase history
router.get("/purchases", async (req, res) => {
    try {
        const ipAddress = getClientIp(req);
        const user = await (0, init_1.getUserByIp)(ipAddress);
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
        const purchases = await (0, init_1.getUserPurchases)(user.id, 50);
        const stats = await (0, init_1.getUserPurchaseStats)(user.id);
        return res.status(200).json({
            purchases: purchases.map((p) => ({
                id: p.id,
                quantity: p.quantity,
                purchasedAt: p.purchasedAt
            })),
            stats: {
                totalPurchases: parseInt(stats.total_purchases) || 0,
                totalQuantity: parseInt(stats.total_quantity) || 0,
                firstPurchase: stats.first_purchase,
                lastPurchase: stats.last_purchase
            }
        });
    }
    catch (error) {
        console.error('Error in /purchases route:', error);
        return res.status(500).json({
            message: "Something went wrong while fetching your purchases"
        });
    }
});
// Get all purchases
router.get("/purchases/all", async (req, res) => {
    try {
        const purchases = await (0, init_1.getAllPurchases)(100);
        return res.status(200).json({
            purchases: purchases.map((p) => ({
                id: p.id,
                userId: p.user_id,
                ipAddress: p.ip_address,
                quantity: p.quantity,
                purchasedAt: p.purchased_at
            }))
        });
    }
    catch (error) {
        console.error('Error in /purchases/all route:', error);
        return res.status(500).json({
            message: "Something went wrong while fetching purchases"
        });
    }
});
exports.default = router;
