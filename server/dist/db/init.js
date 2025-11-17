"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
exports.getUserByIp = getUserByIp;
exports.createUser = createUser;
exports.createPurchase = createPurchase;
exports.getUserPurchases = getUserPurchases;
exports.getAllPurchases = getAllPurchases;
exports.getUserPurchaseStats = getUserPurchaseStats;
const connection_1 = __importDefault(require("./connection"));
async function waitForDatabase(maxRetries = 10, delayMs = 2000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await connection_1.default.$queryRaw `SELECT 1`;
            return;
        }
        catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
            console.log(`Database not ready, retrying in ${delayMs}ms... (${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}
async function initializeDatabase() {
    try {
        await waitForDatabase();
        console.log('Database connected successfully');
        // For existing databases, ensure schema exists using raw SQL
        // In production, use Prisma migrations: npx prisma migrate deploy
        // For new databases, run: npx prisma migrate dev --name init
        await connection_1.default.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                ip_address VARCHAR(45) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await connection_1.default.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS purchases (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                quantity INTEGER DEFAULT 1
            )
        `);
        await connection_1.default.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id)
        `);
        await connection_1.default.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS idx_purchases_purchased_at ON purchases(purchased_at)
        `);
        await connection_1.default.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS idx_users_ip_address ON users(ip_address)
        `);
        console.log('Database schema initialized successfully');
    }
    catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}
async function getUserByIp(ipAddress) {
    try {
        return await connection_1.default.user.findUnique({
            where: { ipAddress }
        });
    }
    catch (error) {
        console.error('Error getting user by IP:', error);
        throw error;
    }
}
async function createUser(ipAddress) {
    try {
        return await connection_1.default.user.upsert({
            where: { ipAddress },
            update: { updatedAt: new Date() },
            create: { ipAddress }
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}
async function createPurchase(userId, quantity = 1) {
    try {
        return await connection_1.default.purchase.create({
            data: {
                userId,
                quantity
            }
        });
    }
    catch (error) {
        console.error('Error creating purchase:', error);
        throw error;
    }
}
async function getUserPurchases(userId, limit = 10) {
    try {
        return await connection_1.default.purchase.findMany({
            where: { userId },
            orderBy: { purchasedAt: 'desc' },
            take: limit
        });
    }
    catch (error) {
        console.error('Error getting user purchases:', error);
        throw error;
    }
}
async function getAllPurchases(limit = 50) {
    try {
        const purchases = await connection_1.default.purchase.findMany({
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
        // Transform to match the expected format with ip_address at the root level
        return purchases.map((p) => ({
            id: p.id,
            user_id: p.userId,
            ip_address: p.user.ipAddress,
            quantity: p.quantity,
            purchased_at: p.purchasedAt
        }));
    }
    catch (error) {
        console.error('Error getting all purchases:', error);
        throw error;
    }
}
async function getUserPurchaseStats(userId) {
    try {
        const [count, sum, min, max] = await Promise.all([
            connection_1.default.purchase.count({
                where: { userId }
            }),
            connection_1.default.purchase.aggregate({
                where: { userId },
                _sum: { quantity: true }
            }),
            connection_1.default.purchase.findFirst({
                where: { userId },
                orderBy: { purchasedAt: 'asc' },
                select: { purchasedAt: true }
            }),
            connection_1.default.purchase.findFirst({
                where: { userId },
                orderBy: { purchasedAt: 'desc' },
                select: { purchasedAt: true }
            })
        ]);
        return {
            total_purchases: count.toString(),
            total_quantity: (sum._sum.quantity || 0).toString(),
            first_purchase: min?.purchasedAt || null,
            last_purchase: max?.purchasedAt || null
        };
    }
    catch (error) {
        console.error('Error getting user purchase stats:', error);
        throw error;
    }
}
