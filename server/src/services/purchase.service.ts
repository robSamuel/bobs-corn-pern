import { Purchase } from '@prisma/client';
import { PurchaseModel, PurchaseStats, PurchaseWithUser } from '../models/purchase.model';
import { UserModel } from '../models/user.model';

export type PurchaseHistory = {
    purchases: Purchase[];
    stats: PurchaseStats;
};

export class PurchaseService {
    constructor(
        private readonly userModel = new UserModel(),
        private readonly purchaseModel = new PurchaseModel()
    ) {}

    async processPurchase(ipAddress: string) {
        const user = await this.userModel.createOrUpdate(ipAddress);
        const purchase = await this.purchaseModel.create(user.id, 1);

        return { user, purchase };
    }

    async getPurchaseHistory(ipAddress: string): Promise<PurchaseHistory> {
        const user = await this.userModel.findByIp(ipAddress);

        if (!user) {
            return {
                purchases: [],
                stats: {
                    totalPurchases: 0,
                    totalQuantity: 0,
                    firstPurchase: null,
                    lastPurchase: null
                }
            };
        }

        const [purchases, stats] = await Promise.all([
            this.purchaseModel.findByUser(user.id, 50),
            this.purchaseModel.getStatsForUser(user.id)
        ]);

        return { purchases, stats };
    }

    async getAllPurchases(limit: number = 100): Promise<PurchaseWithUser[]> {
        return this.purchaseModel.findAllWithUsers(limit);
    }
}


