
import type { NextApiRequest, NextApiResponse } from 'next';
import { getHolidays, createHoliday } from '@/lib/firebase/firestore';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    switch (req.method) {
        case 'GET':
            try {
                const holidays = await getHolidays();
                res.status(200).json(holidays);
            } catch (error) {
                res.status(500).json({ message: 'Internal Server Error', error });
            }
            break;

        case 'POST':
            const session = await getSession({ req });
            if (!session || !session.user || (session.user as any).role !== 'admin') {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            try {
                const newHoliday = await createHoliday(req.body);
                res.status(201).json(newHoliday);
            } catch (error) {
                res.status(500).json({ message: 'Internal Server Error', error });
            }
            break;
        
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
