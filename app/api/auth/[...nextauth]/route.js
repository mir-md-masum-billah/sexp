// C:\Users\Admin\Desktop\sexp\app\api\auth\[...nextauth]\route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import User from "@/model/user";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "johndoe" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    await connectDB();

                    // Find user by username
                    const user = await User.findOne({
                        username: credentials.username
                    });

                    if (!user) {
                        throw new Error("No user found with this username");
                    }

                    // Compare password
                    const isValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isValid) {
                        throw new Error("Invalid password");
                    }

                    // Return user object
                    return {
                        id: user._id.toString(),
                        name: user.name || user.username,
                        username: user.username,
                        profilepic: user.profilepic || '',
                    };
                } catch (error) {
                    console.error("Authorization error:", error);
                    throw new Error(error.message || "Authentication failed");
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.profilepic = user.profilepic;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.profilepic = token.profilepic;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };