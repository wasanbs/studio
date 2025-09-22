'use client';

import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import Head from 'next/head';
import { User, Lock, LogIn, Loader2 } from 'lucide-react';

export default function SignIn() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
        router.replace('/bsleave');
        return;
    }

    const error = searchParams?.get('error');
    if (error) {
        let errorMessage = 'An unknown error occurred during sign-in.';
        switch (error) {
            case 'AccessDenied':
                errorMessage = "Sign-in failed. Your email is not authorized to access this application.";
                break;
            case 'CredentialsSignin':
                errorMessage = "Sign-in failed. Please check your email and password.";
                break;
            case 'OAuthAccountNotLinked':
                errorMessage = "This email is already linked with another provider. Please sign in with the original method.";
                break;
            default:
                errorMessage = `Sign-in error: ${error}`;
                break;
        }

        toast.error(errorMessage, { duration: 6000 });
        
        // This is tricky in App router, for now, we just let the error stay in the URL
        // A better solution would involve middleware or a different state management
    }
  }, [status, router, searchParams]);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn('credentials', {
        email,
        password,
        callbackUrl: '/bsleave',
    });
  };

  if (status === "loading" || status === "authenticated") {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <div className="flex items-center space-x-3 p-8 bg-card rounded-lg shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
                <p className="text-lg font-semibold">Loading...</p>
                <p className="text-sm text-muted-foreground">Authenticating and redirecting, please wait.</p>
            </div>
            </div>
        </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Sign In - BS Portal</title>
      </Head>
      <div className="w-full min-h-screen flex flex-col p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full z-0">
          <div className="absolute top-[10%] left-[10%] w-32 h-32 bg-blue-200 rounded-full opacity-50 animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-[20%] right-[15%] w-24 h-24 bg-indigo-200 rounded-lg opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-[15%] left-[25%] w-40 h-40 bg-pink-200 rounded-full opacity-50 animate-float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-[5%] right-[5%] w-20 h-20 bg-teal-200 rounded-lg opacity-60 animate-float" style={{ animationDelay: '6s' }}></div>
           <div className="absolute top-[60%] left-[5%] w-28 h-28 bg-purple-200 rounded-full opacity-40 animate-float" style={{ animationDelay: '8s' }}></div>
        </div>
        
        <main className="flex-grow flex flex-col items-center justify-center z-10">
            <div className="text-center space-y-2 mb-6">
                <h1 className="text-4xl text-primary font-bold text-shadow">
                BS Portal
                </h1>
                <p className="text-primary text-shadow">
                พอร์ทัลสำหรับพนักงาน
                </p>
            </div>
            <div className="w-full max-w-sm flex flex-col items-center">
                <div className="relative flex items-center w-full my-2">
                    <div className="flex-grow border-t border-t-2 border-white/50"></div>
                    <img id="login-logo" alt="Busisoft Logo" data-ai-hint="company logo" loading="lazy" width="150" height="150" decoding="async" data-nimg="1" className="object-contain mx-4 logo-filter" src="https://busisoft.co.th/wp-content/uploads/2020/11/logo.png" style={{color: 'transparent'}} />
                    <div className="flex-grow border-t border-t-2 border-white/50"></div>
                </div>

                    <button
                        onClick={() => signIn('google', { callbackUrl: '/bsleave' })}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white h-11 px-4 py-2 w-full bg-white/80 text-gray-500 hover:bg-white/90 transition-all duration-300 mt-6 shadow"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" className="mr-2 h-5 w-5"><path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.686H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c22.692-21.036 35.89-53.377 35.89-91.829z"></path><path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.34 221.722 79.81 261.1 130.55 261.1z"></path><path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.475.446C3.048 89.199 0 109.517 0 130.55s3.048 41.351 13.785 58.79l42.5-33.01z"></path><path fill="#EB4335" d="M130.55 50.479c19.231 0 34.421 8.053 42.636 15.631l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.81 0 35.34 39.378 13.785 71.751l42.5 33.01c10.445-31.477 39.746-54.25 74.265-54.25z"></path></svg>
                        Sign in with Google
                    </button>

                    <div className="relative flex py-5 items-center w-full">
                        <div className="flex-grow border-t border-t-2 border-white/50"></div>
                        <span className="flex-shrink mx-4 text-white/50">or</span>
                        <div className="flex-grow border-t border-t-2 border-white/50"></div>
                    </div>

                    <form onSubmit={handleCredentialsSignIn} className="grid gap-3 w-full">
                       <div className="relative flex items-center w-full rounded-lg border border-white">
                            <span className="flex items-center justify-center h-full px-4 bg-white/10 rounded-l-lg">
                                <User className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                className="flex h-11 w-full rounded-r-md bg-white/80 px-3 py-2 text-sm text-gray-500 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                                id="email"
                                placeholder="Email or Username"
                                required
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative flex items-center w-full rounded-lg border border-white">
                             <span className="flex items-center justify-center h-full px-4 bg-white/10 rounded-l-lg">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                className="flex h-11 w-full rounded-r-md bg-white/80 px-3 py-2 text-sm text-gray-500 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                                id="password"
                                placeholder="Password"
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-4 py-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow mt-5 font-medium"
                        type="submit"
                        >
                        Sign In
                        <LogIn className="ml-2 h-5 w-5"/>
                        </button>
                        <div className="w-full max-w-sm mx-auto pt-4">
                            <div className="border-t-2 border-white/50"></div>
                        </div>
                    </form>
            </div>
        </main>
        <footer className="text-center text-sm text-black/40 py-4 z-10 font-light">
          © Copyright {new Date().getFullYear()} Busisoft (Thailand) Company Limited. All rights reserved.
        </footer>
      </div>
    </>
  );
}
