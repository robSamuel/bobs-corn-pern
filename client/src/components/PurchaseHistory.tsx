import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import isDocker from 'is-docker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';

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

        const socket = io(socketUrl, {
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        socket.on('newPurchase', (purchase: Purchase) => {
            setPurchases((prev) => [purchase, ...prev].slice(0, 100)); // Keep last 100 purchases
        });

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
        <Card className="w-full max-w-4xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
                {purchases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-lg">No purchases yet. Be the first to buy corn! 🌽</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Purchased At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchases.map((purchase) => (
                                <TableRow 
                                    key={purchase.id} 
                                    className={purchase.id === purchases[0]?.id ? 'bg-green-50 dark:bg-green-950/20' : ''}
                                >
                                    <TableCell className="font-medium">
                                        {purchase.id === purchases[0]?.id && (
                                            <Badge variant="secondary" className="mr-2">New</Badge>
                                        )}
                                        {purchase.id}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {maskIpAddress(purchase.ipAddress)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{purchase.quantity}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(purchase.purchasedAt)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

export default PurchaseHistory;

