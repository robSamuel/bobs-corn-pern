import { User } from '@prisma/client';
import prisma from '../db/connection';

export class UserModel {
    async findByIp(ipAddress: string): Promise<User | null> {
        try {
            return await prisma.user.findUnique({
                where: { ipAddress }
            });
        } catch (error) {
            console.error('Error finding user by IP:', error);
            throw error;
        }
    }

    async createOrUpdate(ipAddress: string): Promise<User> {
        try {
            return await prisma.user.upsert({
                where: { ipAddress },
                update: { updatedAt: new Date() },
                create: { ipAddress }
            });
        } catch (error) {
            console.error('Error creating or updating user:', error);
            throw error;
        }
    }
}


