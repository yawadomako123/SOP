"use server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/client";
import { hashPassword } from "better-auth/crypto";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function createStaffMember(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!name || !email || !password || !role) {
      return { success: false, error: "All fields are required" };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "A user with this email already exists" };
    }

    // Hash password using the identical algorithm Better Auth uses
    const hashedPassword = await hashPassword(password);

    // Create the user manually in Prisma
    const newUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        emailVerified: false,
        role: role.toUpperCase() as Role,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create the Account record that BetterAuth expects for email/password auth
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        userId: newUser.id,
        accountId: email,
        providerId: "credential",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Revalidate the staff page immediately to show the new card
    revalidatePath("/manager/staff");
    
    return { success: true };
    
  } catch (err: any) {
    console.error("Error creating staff:", err);
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

export async function approveUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" }
    });
    revalidatePath("/manager/staff");
    revalidatePath("/manager");
  } catch (err: any) {
    console.error("Error approving user:", err);
  }
}

export async function suspendUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "SUSPENDED" }
    });
    revalidatePath("/manager/staff");
    revalidatePath("/manager");
  } catch (err: any) {
    console.error("Error suspending user:", err);
  }
}
