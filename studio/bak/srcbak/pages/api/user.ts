
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '@/lib/firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { email } = req.query;
        if (typeof email !== 'string') {
            return res.status(400).json({ message: 'Email is required' });
        }
        try {
            const user = await getUser(email);
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
