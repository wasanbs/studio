
'use client'

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; 

    if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/bsleave');
      }
    } else {
      router.replace('/auth/signin');
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Loading...</h3>
        <p className="mt-1 text-sm text-gray-500">Redirecting you to the appropriate page.</p>
      </div>
    </div>
  );
}
