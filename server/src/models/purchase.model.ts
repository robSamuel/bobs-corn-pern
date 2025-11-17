import { Purchase } from '@prisma/client';
import prisma from '../db/connection';

export type PurchaseWithUser = Purchase & {
    user: {
        ipAddress: string;
    };
};

export type PurchaseStats = {
    totalPurchases: number;
    totalQuantity: number;
    firstPurchase: Date | null;
    lastPurchase: Date | null;
};

export class PurchaseModel {
    async create(userId: number, quantity: number = 1): Promise<Purchase> {
        try {
            return await prisma.purchase.create({
                data: {
                    userId,
                    quantity
                }
            });
        } catch (error) {
            console.error('Error creating purchase:', error);
            throw error;
        }
    }

    async findByUser(userId: number, limit: number = 50): Promise<Purchase[]> {
        try {
            return await prisma.purchase.findMany({
                where: { userId },
                orderBy: { purchasedAt: 'desc' },
                take: limit
            });
        } catch (error) {
            console.error('Error finding purchases for user:', error);
            throw error;
        }
    }

    async findAllWithUsers(limit: number = 100): Promise<PurchaseWithUser[]> {
        try {
            return await prisma.purchase.findMany({
                include: {
                    user: {
                        select: {
                            ipAddress: true
                        }
                    }
                },
                orderBy: { purchasedAt: 'desc' },
                take: limit
            });
        } catch (error) {
            console.error('Error retrieving all purchases:', error);
            throw error;
        }
    }

    async getStatsForUser(userId: number): Promise<PurchaseStats> {
        try {
            const [count, sum, firstPurchase, lastPurchase] = await Promise.all([
                prisma.purchase.count({
                    where: { userId }
                }),
                prisma.purchase.aggregate({
                    where: { userId },
                    _sum: { quantity: true }
                }),
                prisma.purchase.findFirst({
                    where: { userId },
                    orderBy: { purchasedAt: 'asc' },
                    select: { purchasedAt: true }
                }),
                prisma.purchase.findFirst({
                    where: { userId },
                    orderBy: { purchasedAt: 'desc' },
                    select: { purchasedAt: true }
                })
            ]);

            return {
                totalPurchases: count,
                totalQuantity: sum._sum.quantity || 0,
                firstPurchase: firstPurchase?.purchasedAt || null,
                lastPurchase: lastPurchase?.purchasedAt || null
            };
        } catch (error) {
            console.error('Error retrieving purchase stats:', error);
            throw error;
        }
    }
}


