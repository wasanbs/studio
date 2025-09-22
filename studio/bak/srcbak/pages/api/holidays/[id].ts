
import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteHoliday } from '@/lib/firebase/firestore';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    if (!session || !session.user || (session.user as any).role !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid holiday ID' });
    }

    if (req.method === 'DELETE') {
        try {
            await deleteHoliday(id);
            res.status(204).end(); // No Content
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
