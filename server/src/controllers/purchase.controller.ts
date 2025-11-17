import { Request, Response } from 'express';
import { getIO } from '../socket';
import { PurchaseService } from '../services/purchase.service';
import { PurchaseView } from '../views/purchase.view';
import { getClientIp } from '../utils/request.util';

export class PurchaseController {
    constructor(private readonly purchaseService = new PurchaseService()) {}

    buyCorn = async (req: Request, res: Response) => {
        try {
            const ipAddress = getClientIp(req);
            const { user, purchase } = await this.purchaseService.processPurchase(ipAddress);

            try {
                const io = getIO();
                io.emit('newPurchase', {
                    id: purchase.id,
                    userId: user.id,
                    ipAddress,
                    quantity: purchase.quantity,
                    purchasedAt: purchase.purchasedAt
                });
            } catch (socketError) {
                console.warn('Socket not initialized, skipping broadcast:', socketError);
            }

            return PurchaseView.sendPurchaseConfirmation(res, {
                purchase,
                userId: user.id,
                ipAddress
            });
        } catch (error) {
            console.error('Error processing /buy request:', error);
            return PurchaseView.sendError(res, 500, 'Something went wrong while processing your purchase');
        }
    };

    getUserPurchases = async (req: Request, res: Response) => {
        try {
            const ipAddress = getClientIp(req);
            const data = await this.purchaseService.getPurchaseHistory(ipAddress);

            return PurchaseView.sendPurchaseHistory(res, data);
        } catch (error) {
            console.error('Error fetching /purchases data:', error);
            return PurchaseView.sendError(res, 500, 'Something went wrong while fetching your purchases');
        }
    };

    getAllPurchases = async (_req: Request, res: Response) => {
        try {
            const purchases = await this.purchaseService.getAllPurchases(100);
            return PurchaseView.sendAllPurchases(res, { purchases });
        } catch (error) {
            console.error('Error fetching /purchases/all data:', error);
            return PurchaseView.sendError(res, 500, 'Something went wrong while fetching purchases');
        }
    };
}


