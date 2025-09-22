
import type { NextApiRequest, NextApiResponse } from 'next';
import { getLeaveRequests, createLeaveRequest, getUser, updateUser } from '@/lib/firebase/firestore';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    if (!session?.user?.email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    switch (req.method) {
        case 'GET':
            try {
                const { email } = req.query;
                // Correct way to check for admin role on the server-side
                const isAdmin = (session.user as any).role === 'admin';
                
                let requests;
                if(isAdmin && !email) {
                    requests = await getLeaveRequests();
                } else {
                    const targetEmail = (email as string) || session.user.email;
                    // Ensure non-admins can only fetch their own requests
                    if (!isAdmin && targetEmail !== session.user.email) {
                        return res.status(403).json({ message: 'Forbidden' });
                    }
                    requests = await getLeaveRequests(targetEmail);
                }

                res.status(200).json(requests);
            } catch (error) {
                res.status(500).json({ message: 'Internal Server Error', error });
            }
            break;

        case 'POST':
            try {
                const { email, leaveType, reason, date } = req.body;
                 if (email !== session.user.email) {
                    return res.status(403).json({ message: 'Forbidden' });
                }

                const user = await getUser(email);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                const leaveField = `${leaveType}Leave`;
                if (!user[leaveField] || user[leaveField].remaining <= 0) {
                    return res.status(400).json({ message: `No ${leaveType} leave remaining.`});
                }

                const newRequest = await createLeaveRequest({ email, leaveType, reason, date, status: 'pending' });
                
                // Deduct leave immediately upon request
                const remaining = user[leaveField].remaining - 1;
                await updateUser(email, {
                    [`${leaveField}.remaining`]: remaining
                });

                res.status(201).json(newRequest);
            } catch (error) {
                console.error("Error creating leave request:", error);
                res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
            }
            break;
        
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
