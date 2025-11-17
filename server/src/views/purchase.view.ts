import { Response } from 'express';
import { Purchase } from '@prisma/client';
import { PurchaseStats, PurchaseWithUser } from '../models/purchase.model';

type PurchaseConfirmationPayload = {
    purchase: Purchase;
    userId: number;
    ipAddress: string;
};

type PurchaseHistoryPayload = {
    purchases: Purchase[];
    stats: PurchaseStats;
};

type AllPurchasesPayload = {
    purchases: PurchaseWithUser[];
};

export class PurchaseView {
    static sendPurchaseConfirmation(res: Response, payload: PurchaseConfirmationPayload) {
        const { purchase } = payload;

        return res.status(200).json({
            message: 'You successfully bought corn!',
            purchase: {
                id: purchase.id,
                purchasedAt: purchase.purchasedAt
            }
        });
    }

    static sendPurchaseHistory(res: Response, payload: PurchaseHistoryPayload) {
        const { purchases, stats } = payload;

        return res.status(200).json({
            purchases: purchases.map((purchase: Purchase) => ({
                id: purchase.id,
                quantity: purchase.quantity,
                purchasedAt: purchase.purchasedAt
            })),
            stats: {
                totalPurchases: stats.totalPurchases,
                totalQuantity: stats.totalQuantity,
                firstPurchase: stats.firstPurchase,
                lastPurchase: stats.lastPurchase
            }
        });
    }

    static sendAllPurchases(res: Response, payload: AllPurchasesPayload) {
        const { purchases } = payload;

        return res.status(200).json({
            purchases: purchases.map((purchase) => ({
                id: purchase.id,
                userId: purchase.userId,
                ipAddress: purchase.user.ipAddress,
                quantity: purchase.quantity,
                purchasedAt: purchase.purchasedAt
            }))
        });
    }

    static sendError(res: Response, status: number, message: string) {
        return res.status(status).json({ message });
    }
}


