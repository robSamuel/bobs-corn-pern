import pool from './connection';

const schemaStatements = [
    // Create users table
    `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Create purchases table
    `CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        quantity INTEGER DEFAULT 1
    )`,
    
    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_purchases_purchased_at ON purchases(purchased_at)`,
    `CREATE INDEX IF NOT EXISTS idx_users_ip_address ON users(ip_address)`
];

async function waitForDatabase(maxRetries: number = 10, delayMs: number = 2000): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const client = await pool.connect();
            await client.query('SELECT 1');
            client.release();
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

        const client = await pool.connect();

        for (const statement of schemaStatements) {
            await client.query(statement);
        }
        
        console.log('Database schema initialized successfully');
        
        client.release();
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

export async function getUserByIp(ipAddress: string) {
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE ip_address = $1',
            [ipAddress]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error getting user by IP:', error);
        throw error;
    }
}

export async function createUser(ipAddress: string) {
    try {
        const result = await pool.query(
            'INSERT INTO users (ip_address) VALUES ($1) ON CONFLICT (ip_address) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING *',
            [ipAddress]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export async function createPurchase(userId: number, quantity: number = 1) {
    try {
        const result = await pool.query(
            'INSERT INTO purchases (user_id, quantity) VALUES ($1, $2) RETURNING *',
            [userId, quantity]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating purchase:', error);
        throw error;
    }
}

export async function getUserPurchases(userId: number, limit: number = 10) {
    try {
        const result = await pool.query(
            'SELECT * FROM purchases WHERE user_id = $1 ORDER BY purchased_at DESC LIMIT $2',
            [userId, limit]
        );
        return result.rows;
    } catch (error) {
        console.error('Error getting user purchases:', error);
        throw error;
    }
}

export async function getAllPurchases(limit: number = 50) {
    try {
        const result = await pool.query(
            `SELECT p.*, u.ip_address 
             FROM purchases p 
             JOIN users u ON p.user_id = u.id 
             ORDER BY p.purchased_at DESC 
             LIMIT $1`,
            [limit]
        );
        return result.rows;
    } catch (error) {
        console.error('Error getting all purchases:', error);
        throw error;
    }
}

export async function getUserPurchaseStats(userId: number) {
    try {
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_purchases,
                SUM(quantity) as total_quantity,
                MIN(purchased_at) as first_purchase,
                MAX(purchased_at) as last_purchase
             FROM purchases 
             WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error getting user purchase stats:', error);
        throw error;
    }
}

