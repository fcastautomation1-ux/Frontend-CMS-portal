import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createServerClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const username = String(credentials.username).trim().toLowerCase();
        const password = String(credentials.password);

        const supabase = createServerClient();
        const { data: users, error } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .limit(1);

        if (error || !users || users.length === 0) return null;

        const user = users[0];

        // Verify password - support hashed and legacy plain-text
        let valid = false;
        if (user.password_hash && user.password_salt) {
          valid = await bcrypt.compare(password, user.password_hash);
          if (!valid) {
            // Try legacy SHA-256 comparison (from GAS migration)
            const { createHash } = await import("crypto");
            const combined = "GASv1_" + user.password_salt + password;
            const hash = createHash("sha256").update(combined).digest("hex");
            valid = hash === user.password_hash;
          }
        } else if (user.password === password) {
          // Legacy plain-text - upgrade to bcrypt
          valid = true;
          const hashed = await bcrypt.hash(password, 12);
          await supabase
            .from("users")
            .update({ password_hash: hashed, password_salt: "bcrypt" })
            .eq("username", username);
        }

        if (!valid) return null;

        // Update last login
        await supabase
          .from("users")
          .update({ last_login: new Date().toISOString() })
          .eq("username", username);

        return {
          id: user.username,
          name: user.username,
          email: user.email || "",
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
});
