'use client';

import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import FirebaseAuth from '@/components/FirebaseAuth';
import { Loader } from 'lucide-react';

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 w-full max-w-md items-center justify-between text-sm lg:flex flex-col">
          <h1 className="text-4xl font-bold mb-8">Leave Portal</h1>
          <FirebaseAuth />
        </div>
      </main>
    );
  }

  return null;
}
