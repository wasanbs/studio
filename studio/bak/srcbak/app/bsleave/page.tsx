'use client';

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const BSLeaveDashboard = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [leaveData, setLeaveData] = useState(null);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leaveType, setLeaveType] = useState("sick");
    const [leaveReason, setLeaveReason] = useState("");
    const [leaveDate, setLeaveDate] = useState("");
    
    const fetchDashboardData = async (email: string) => {
        const res = await fetch(`/api/user?email=${email}`);
        if (res.ok) {
            const data = await res.json();
            setLeaveData(data);
        } else {
            console.error("Failed to fetch user data for", email);
            toast.error("Failed to load your leave balance.");
            setLeaveData(null);
        }

        const reqRes = await fetch(`/api/leave?email=${email}`);
        if (reqRes.ok) {
            const reqData = await reqRes.json();
            setLeaveRequests(reqData);
        } else {
            console.error("Failed to fetch leave requests for", email);
        }
    };

    const fetchHolidays = async () => {
        const res = await fetch("/api/holidays");
        if (res.ok) {
            const data = await res.json();
            setHolidays(data);
        } else {
             console.error("Failed to fetch holidays");
        }
    }
    
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/auth/signin');
        }
        if (status === "authenticated" && session?.user?.email) {
            fetchDashboardData(session.user.email);
            fetchHolidays();
        }
    }, [status, session, router]);

    const handleRequestLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!session?.user?.email) {
            toast.error("You must be logged in to request leave.");
            return;
        }

        const toastId = toast.loading('Submitting leave request...');
        const res = await fetch("/api/leave", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: session.user.email,
                leaveType,
                reason: leaveReason,
                date: leaveDate,
            }),
        });

        if (res.ok) {
            toast.success('Leave request submitted successfully!', { id: toastId });
            setIsModalOpen(false);
            setLeaveReason("");
            setLeaveDate("");
            if (session.user.email) fetchDashboardData(session.user.email); // Refresh leave requests and balance
        } else {
            const error = await res.json();
            toast.error(`Error: ${error.message}`, { id: toastId });
        }
    };

    if (status === "loading" || !leaveData || !session) {
        return (
             <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Loading User Data...</h3>
                    <p className="mt-1 text-sm text-gray-500">Authenticating and fetching your data. Please wait.</p>
                </div>
            </div>
        );
    }
    
    const currentUser = leaveData as any;

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">BSLeave - Leave Management</h1>
                    {session?.user && (
                        <div className="flex items-center">
                            {session.user.image && <img src={session.user.image} alt="User" className="w-10 h-10 rounded-full mr-4"/>}
                            <span className="text-gray-700 mr-4">{session.user.name} ({session.user.email})</span>
                            <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 rounded">Sign Out</button>
                        </div>
                    )}
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div className="bg-white p-6 rounded-lg shadow">
                               <h3 className="text-lg font-medium text-gray-900">Sick Leave</h3>
                               <p className="mt-2 text-3xl font-bold text-gray-900">{currentUser.sickLeave.remaining} / {currentUser.sickLeave.total}</p>
                               <p className="text-sm text-gray-500">days remaining</p>
                           </div>
                           <div className="bg-white p-6 rounded-lg shadow">
                               <h3 className="text-lg font-medium text-gray-900">Personal Leave</h3>
                               <p className="mt-2 text-3xl font-bold text-gray-900">{currentUser.personalLeave.remaining} / {currentUser.personalLeave.total}</p>
                               <p className="text-sm text-gray-500">days remaining</p>
                           </div>
                           <div className="bg-white p-6 rounded-lg shadow">
                               <h3 className="text-lg font-medium text-gray-900">Vacation</h3>
                               <p className="mt-2 text-3xl font-bold text-gray-900">{currentUser.vacation.remaining} / {currentUser.vacation.total}</p>
                               <p className="text-sm text-gray-500">days remaining</p>
                           </div>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-sm hover:bg-blue-700">
                            Request Leave
                        </button>
                    </div>

                     <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Leave Requests</h2>
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {leaveRequests.map((request: any) => (
                                        <tr key={request.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(request.date)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.leaveType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.reason}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Holidays</h2>
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {holidays.map((holiday: any) => (
                                        <tr key={holiday.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(holiday.date)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{holiday.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {isModalOpen && (
                 <div className="fixed z-10 inset-0 overflow-y-auto">
                 <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                     <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                         <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                     </div>
                     <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                     <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                         <form onSubmit={handleRequestLeave}>
                             <div>
                                 <h3 className="text-lg leading-6 font-medium text-gray-900">Request Leave</h3>
                                 <div className="mt-4">
                                     <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">Leave Type</label>
                                     <select id="leaveType" value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                         <option value="sick">Sick Leave</option>
                                         <option value="personal">Personal Leave</option>
                                         <option value="vacation">Vacation</option>
                                     </select>
                                 </div>
                                 <div className="mt-4">
                                     <label htmlFor="leaveDate" className="block text-sm font-medium text-gray-700">Date</label>
                                     <input type="date" id="leaveDate" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} required className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                 </div>
                                 <div className="mt-4">
                                     <label htmlFor="leaveReason" className="block text-sm font-medium text-gray-700">Reason</label>
                                     <textarea id="leaveReason" value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} rows={3} required className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"></textarea>
                                 </div>
                             </div>
                             <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                 <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm">
                                     Submit
                                 </button>
                                 <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm">
                                     Cancel
                                 </button>
                             </div>
                         </form>
                     </div>
                 </div>
             </div>
            )}
        </div>
    );
};

export default BSLeaveDashboard;
