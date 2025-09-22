
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { getUser, createUser } from "@/lib/firebase/firestore";
import type { User } from "next-auth";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        authorization: {
            params: {
              prompt: "consent",
              access_type: "offline",
              response_type: "code",
            },
        },
    }),
    Credentials({
        name: 'Credentials',
        credentials: {
          email: { label: "Email", type: "text" },
          password: {  label: "Password", type: "password" }
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                throw new Error('Please enter an email and password');
            }

            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            if (credentials.email === 'admin' && credentials.password === '1234') {
                return {
                    id: 'local-admin',
                    email: adminEmail,
                    name: 'Local Admin',
                    image: '',
                    role: 'admin'
                } as User;
            }
            
            const user = await getUser(credentials.email as string);
            
            if (user && user.email === credentials.password) {
                return {
                    id: user.email,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role
                } as User;
            } else {
                return null;
            }
        }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user?.email) return false;
        
        const email = user.email;
        const allowedDomain = "busisoft.co.th";
        const specialUsers = ["tumtazmanian@gmail.com", "wasan@busisoft.co"];
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

        const isAllowed = 
          email.endsWith(`@${allowedDomain}`) ||
          specialUsers.includes(email) ||
          email === adminEmail;

        if (!isAllowed) return false;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) { // User is available on initial sign in
        token.role = (user as any).role;
      }

      if (account?.provider === 'google' && token.email) {
        let dbUser = await getUser(token.email);
        if (!dbUser) {
           const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
           const newUser = {
               email: token.email,
               name: token.name,
               image: token.picture,
               role: token.email === adminEmail ? 'admin' : 'user',
               sickLeave: { total: 15, remaining: 15 },
               personalLeave: { total: 10, remaining: 10 },
               vacation: { total: 20, remaining: 20 },
           };
           await createUser(newUser);
           dbUser = newUser;
        }
        token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  }
})


