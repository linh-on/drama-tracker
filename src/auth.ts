import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [credentials.email],
          );

          const user = result.rows[0];
          if (!user) return null;
          if (!user.email_verified) return null;
          if (user.status !== "approved") return null;

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
        } catch (err) {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.status = token.status as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.status = (user as any).status;
      }
      return token;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },
});
