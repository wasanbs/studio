
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from './config'; // Use the single app instance from config.ts

const db = getFirestore(app);

const basePath = 'BS Portal/YypUYQQ3lLqOmvhQtLOO';

// User Functions
export const getUser = async (email: string) => {
  const userDocRef = doc(db, `${basePath}/users`, email);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? userDoc.data() : null;
};

export const createUser = async (userData: any) => {
  const userDocRef = doc(db, `${basePath}/users`, userData.email);
  await setDoc(userDocRef, userData);
};

export const updateUser = async (email: string, data: any) => {
  const userDocRef = doc(db, `${basePath}/users`, email);
  await updateDoc(userDocRef, data);
};

// Leave Request Functions
export const getLeaveRequests = async (email?: string) => {
  const leaveRequestsCol = collection(db, `${basePath}/leaveRequests`);
  let q;
  if (email) {
    q = query(leaveRequestsCol, where('email', '==', email));
  } else {
    q = query(leaveRequestsCol);
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createLeaveRequest = async (requestData: any) => {
    const leaveRequestsCol = collection(db, `${basePath}/leaveRequests`);
    const newRequestRef = doc(leaveRequestsCol);
    await setDoc(newRequestRef, { ...requestData, id: newRequestRef.id, status: 'pending' });
    return { id: newRequestRef.id, ...requestData, status: 'pending' };
};


export const updateLeaveRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
  const requestDocRef = doc(db, `${basePath}/leaveRequests`, id);
  await updateDoc(requestDocRef, { status });
};

export const deleteLeaveRequest = async (id: string) => {
    const requestDocRef = doc(db, `${basePath}/leaveRequests`, id);
    await deleteDoc(requestDocRef);
};


// Holiday Functions
export const getHolidays = async () => {
    const holidaysCol = collection(db, `${basePath}/holidays`);
    const holidaySnapshot = await getDocs(holidaysCol);
    return holidaySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createHoliday = async (holidayData: any) => {
    const holidaysCol = collection(db, `${basePath}/holidays`);
    const newHolidayRef = doc(holidaysCol);
    await setDoc(newHolidayRef, { ...holidayData, id: newHolidayRef.id });
    return { id: newHolidayRef.id, ...holidayData };
};

export const deleteHoliday = async (id: string) => {
    const holidayDocRef = doc(db, `${basePath}/holidays`, id);
    await deleteDoc(holidayDocRef);
};


