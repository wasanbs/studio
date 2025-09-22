
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateLeaveRequestStatus, getUser, updateUser, getLeaveRequests } from '@/lib/firebase/firestore';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    if (!session || (session.user as any).role !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid request ID' });
    }

    if (req.method === 'PUT') {
        try {
            const { status } = req.body;
            if (status !== 'approved' && status !== 'rejected') {
                return res.status(400).json({ message: 'Invalid status' });
            }

            // Find the specific leave request to get the user's email
            const allRequests = await getLeaveRequests(); // Fetch all to find the one by ID
            const requestToUpdate = allRequests.find((r: any) => r.id === id);

            if (!requestToUpdate) {
                return res.status(404).json({ message: 'Leave request not found' });
            }

            // If a request is rejected, we need to add the leave day back to the user.
            if (status === 'rejected') {
                const user = await getUser(requestToUpdate.email);
                if(user) {
                    const leaveField = `${requestToUpdate.leaveType}Leave`;
                    // Ensure the field exists before trying to access remaining
                    if (user[leaveField]) {
                        const remaining = user[leaveField].remaining + 1;
                        await updateUser(requestToUpdate.email, {
                            [`${leaveField}.remaining`]: remaining
                        });
                    }
                }
            }
            
            await updateLeaveRequestStatus(id, status);
            res.status(200).json({ message: 'Leave request status updated successfully' });
        } catch (error) {
            console.error("Error updating leave status:", error);
            res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
