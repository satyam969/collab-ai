import NextAuth from "next-auth";  
import CredentialsProvider from "next-auth/providers/credentials";  
import bcrypt from "bcryptjs";   
import connectDB from "../lib/mongodb";   
import User from "../models/user-model";  

const isProduction = process.env.NODE_ENV === "production";



const options = {  
  providers: [  
    CredentialsProvider({  
      name: "Credentials",  
      credentials: {  
        email: { label: "Email", type: "text" },  
        password: { label: "Password", type: "password" },  
      },  
      async authorize(credentials) {  
        await connectDB();  
        const user = await User.findOne({ email: credentials.email }).select("+password");
        if (!user) throw new Error("User not found");  
        
        const passwordMatch = await bcrypt.compare(credentials.password, user.password);  
        if (!passwordMatch) throw new Error("Wrong password");  
        
        return user;   
      },  
    }),  
  ],  
  session: {  
    strategy: "jwt",  
  },  
  cookies: {
    sessionToken: {
      name: isProduction ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction, // Use secure cookies only in production
      },
    },
  },
  callbacks: {  
    async session({ session, token }) {  
      if (token._id) {
        session.user._id = token._id;
      }
      return session;  
    },  
    async jwt({ token, user }) {  
      if (user) {
        token._id = user._id;
      }
      return token;  
    }  
  },
  trustHost: true, // Important for non-standard platforms like Render
  debug: true, // Useful for deployment issues
};

export const authOptions = options;
export default (req, res) => NextAuth(req, res, options);
