import prisma from './connection';

async function waitForDatabase(maxRetries: number = 10, delayMs: number = 2000): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return;
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
            console.log(`Database not ready, retrying in ${delayMs}ms... (${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}

export async function initializeDatabase() {
    try {
        await waitForDatabase();
        console.log('Database connected successfully');

        // For existing databases, ensure schema exists using raw SQL
        // In production, use Prisma migrations: npx prisma migrate deploy
        // For new databases, run: npx prisma migrate dev --name init
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                ip_address VARCHAR(45) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS purchases (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                quantity INTEGER DEFAULT 1
            )
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id)
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS idx_purchases_purchased_at ON purchases(purchased_at)
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS idx_users_ip_address ON users(ip_address)
        `);
        
        console.log('Database schema initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}