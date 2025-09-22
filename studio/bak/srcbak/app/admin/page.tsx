'use client';
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from 'next/navigation';

const AdminDashboard = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
    const [holidayName, setHolidayName] = useState("");
    const [holidayDate, setHolidayDate] = useState("");


    const fetchAllData = async () => {
        const reqRes = await fetch(`/api/leave`);
        if (reqRes.ok) {
            const reqData = await reqRes.json();
            setLeaveRequests(reqData);
        } else {
            console.error("Failed to fetch all leave requests for admin");
        }
        
        const holRes = await fetch(`/api/holidays`);
        if (holRes.ok) {
            const holData = await holRes.json();
            setHolidays(holData);
        } else {
             console.error("Failed to fetch holidays for admin");
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    useEffect(() => {
        if (status === 'loading') {
            return;
        }
        if (status !== 'authenticated' || (session?.user as any)?.role !== 'admin') {
            router.replace('/');
            return;
        }
        fetchAllData();

    }, [status, session, router]);

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        const toastId = toast.loading('Updating status...');
        const res = await fetch(`/api/leave/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });

        if (res.ok) {
            toast.success('Status updated successfully', { id: toastId });
            fetchAllData();
        } else {
            toast.error('Failed to update status', { id: toastId });
        }
    };

    const handleAddHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading('Adding holiday...');
        const res = await fetch('/api/holidays', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: holidayName, date: holidayDate }),
        });

        if (res.ok) {
            toast.success('Holiday added successfully', { id: toastId });
            setIsHolidayModalOpen(false);
            setHolidayName('');
            setHolidayDate('');
            fetchAllData();
        } else {
            toast.error('Failed to add holiday', { id: toastId });
        }
    }

    const handleDeleteHoliday = async (id: string) => {
        if (!confirm('Are you sure you want to delete this holiday?')) return;
        const toastId = toast.loading('Deleting holiday...');
        const res = await fetch(`/api/holidays/${id}`, { method: 'DELETE' });

        if (res.ok) {
            toast.success('Holiday deleted', { id: toastId });
            fetchAllData();
        } else {
            toast.error('Failed to delete holiday', { id: toastId });
        }
    }

    if (status === 'loading' || !session || (session.user as any).role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                     <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Loading Admin Data...</h3>
                    <p className="mt-1 text-sm text-gray-500">Verifying admin access and fetching data. Please wait.</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-100">
             <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard (Leave System)</h1>
                     {session?.user && (
                         <div className="flex items-center">
                            {session.user.image && <img src={session.user.image} alt="Admin" className="w-10 h-10 rounded-full mr-4"/>}
                            <span className="text-gray-700 mr-4">{session.user.name}</span>
                            <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 rounded">Sign Out</button>
                        </div>
                     )}
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                 <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">All Leave Requests</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leaveRequests.map((request: any) => (
                                    <tr key={request.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(request.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.leaveType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {request.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleUpdateStatus(request.id, 'approved')} className="text-green-600 hover:text-green-900 mr-2">Approve</button>
                                                    <button onClick={() => handleUpdateStatus(request.id, 'rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                 <div className="mt-8">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Manage Holidays</h2>
                        <button onClick={() => setIsHolidayModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700">Add Holiday</button>
                     </div>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                               {holidays.map((holiday: any) => (
                                   <tr key={holiday.id}>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(holiday.date)}</td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{holiday.name}</td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                           <button onClick={() => handleDeleteHoliday(holiday.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                       </td>
                                   </tr>
                               ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
             {isHolidayModalOpen && (
                 <div className="fixed z-10 inset-0 overflow-y-auto">
                 <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                     <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                         <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                     </div>
                     <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                     <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                         <form onSubmit={handleAddHoliday}>
                             <h3 className="text-lg leading-6 font-medium text-gray-900">Add Holiday</h3>
                             <div className="mt-4">
                                 <label htmlFor="holidayName" className="block text-sm font-medium text-gray-700">Holiday Name</label>
                                 <input type="text" id="holidayName" value={holidayName} onChange={(e) => setHolidayName(e.target.value)} required className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                             </div>
                             <div className="mt-4">
                                 <label htmlFor="holidayDate" className="block text-sm font-medium text-gray-700">Date</label>
                                 <input type="date" id="holidayDate" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} required className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                             </div>
                             <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                 <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm">
                                     Add Holiday
                                 </button>
                                 <button type="button" onClick={() => setIsHolidayModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm">
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

export default AdminDashboard;
