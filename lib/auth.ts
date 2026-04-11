import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {prisma} from "@/lib/prisma"//your prisma instance




export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  user: {
    additionalFields: {
      status: {
        type: "string",
        required: false,
        defaultValue: "PENDING",
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "CASHIER",
      }
    }
  },

  emailAndPassword: { 
    enabled: true, 
  }, 
  socialProviders: { 
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
    }, 
  },
  callbacks: {
    // Force all self-registered users into the PENDING state.
    // Manager-created users bypass this because they are created directly in Prisma.
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              status: "PENDING"
            }
          };
        }
      }
    }
  }
});
