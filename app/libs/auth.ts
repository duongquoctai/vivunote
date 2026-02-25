import dbConnect from "@/app/libs/mongodb";
import User from "@/app/models/User";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "PIN",
      credentials: {
        username: { label: "Username", type: "text" },
        pin: { label: "PIN", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.pin) {
          throw new Error("Vui lòng nhập đầy đủ thông tin");
        }

        await dbConnect();

        let user = await User.findOne({ username: credentials.username });

        if (user) {
          // Check PIN
          if (user.pin !== credentials.pin) {
            throw new Error("PIN không chính xác");
          }
        } else {
          // Auto create user
          user = await User.create({
            username: credentials.username,
            pin: credentials.pin,
          });
        }

        return {
          id: user._id.toString(),
          name: user.username,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string; name?: string | null }).id =
          token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // We use a modal on the home page
  },
};
