import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { roles: { include: { role: true } } },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        if (user.status !== "ACTIVE") {
          throw new Error(
            user.status === "PENDING"
              ? "حسابك قيد المراجعة، يرجى انتظار موافقة الإدارة"
              : "تم رفض أو تعليق حسابك، تواصل مع الإدارة"
          );
        }

        await logAudit({ userId: user.id, action: "LOGIN", entity: "User", entityId: user.id });

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          roles: user.roles.map((r) => r.role.name),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as { roles?: string[] }).roles ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = (token.roles as string[]) ?? [];
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
