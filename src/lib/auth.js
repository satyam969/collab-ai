import NextAuth from "next-auth";  
import CredentialsProvider from "next-auth/providers/credentials";  
import bcrypt from "bcryptjs";   
import  connectDB  from "../lib/mongodb";   
import User from "../models/user-model";  

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined. Please check your environment variables.");
}

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
    jwt: {  
      secret: process.env.JWT_SECRET,  
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
  }
};  


export const authOptions = options;  


export default (req, res) => NextAuth(req, res, options);