import { Request } from 'express';

export function getClientIp(req: Request): string {
    return (
        req.ip ||
        (Array.isArray(req.headers['x-forwarded-for'])
            ? req.headers['x-forwarded-for'][0]
            : req.headers['x-forwarded-for']) ||
        req.socket.remoteAddress ||
        'unknown'
    );
}


