import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import isDocker from 'is-docker';

interface Purchase {
    id: number;
    userId: number;
    ipAddress: string;
    quantity: number;
    purchasedAt: string;
}

const hostName = isDocker() ? 'express-api' : 'localhost';
const backendUrl = `http://${hostName}:3000`;
const socketUrl = `http://${hostName}:3000`;

function PurchaseHistory() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    useEffect(() => {
        // Fetch initial purchase history
        const fetchPurchases = async () => {
            try {
                const response = await fetch(`${backendUrl}/purchases/all`);
                const data = await response.json();
                if (data.purchases) {
                    setPurchases(data.purchases);
                }
            } catch (error) {
                console.error('Error fetching purchases:', error);
            }
        };

        fetchPurchases();

        // Connect to WebSocket
        const socket = io(socketUrl, {
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        // Listen for new purchases
        socket.on('newPurchase', (purchase: Purchase) => {
            setPurchases((prev) => [purchase, ...prev].slice(0, 100)); // Keep last 100 purchases
        });

        // Cleanup on unmount
        return () => {
            socket.close();
        };
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const maskIpAddress = (ip: string) => {
        // Mask IP's last octet for privacy
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
        }
        return ip;
    };

    return (
        <div style={{ marginTop: '2rem', maxWidth: '800px', margin: '2rem auto' }}>
            <h2>Purchase History</h2>
            {purchases.length === 0 ? (
                <p>No purchases yet. Be the first to buy corn! 🌽</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>ID</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>IP Address</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Quantity</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Purchased At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map((purchase) => (
                            <tr key={purchase.id} style={{ backgroundColor: purchase.id === purchases[0]?.id ? '#e8f5e9' : 'white' }}>
                                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{purchase.id}</td>
                                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{maskIpAddress(purchase.ipAddress)}</td>
                                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{purchase.quantity}</td>
                                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{formatDate(purchase.purchasedAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default PurchaseHistory;

