import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Email + Password
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await pool.query(
          "SELECT * FROM users WHERE email = $1 AND provider = 'credentials'",
          [credentials.email],
        );

        const user = result.rows[0];
        if (!user) return null;

        // Check email is verified
        if (!user.email_verified) return null;

        // Check account is approved
        if (user.status !== "approved") return null;

        // Check password
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash,
        );
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          status: user.status,
        };
      },
    }),

    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign in
      if (account?.provider === "google") {
        const existing = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [user.email],
        );

        if (existing.rows.length === 0) {
          // First time Google login — create pending account
          await pool.query(
            `INSERT INTO users (name, email, provider, status, email_verified)
             VALUES ($1, $2, 'google', 'pending', true)`,
            [user.name, user.email],
          );
          return "/pending";
        }

        const dbUser = existing.rows[0];

        // Not approved yet
        if (dbUser.status === "pending") return "/pending";
        if (dbUser.status !== "approved") return false;

        return true;
      }

      return true;
    },

    async session({ session }) {
      // Add status to session
      if (session.user?.email) {
        const result = await pool.query(
          "SELECT id, status FROM users WHERE email = $1",
          [session.user.email],
        );
        if (result.rows.length > 0) {
          session.user.id = result.rows[0].id;
          session.user.status = result.rows[0].status;
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
