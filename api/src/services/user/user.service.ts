import { CreateUserDto, UpdateUserDto } from "@/dtos/user/user.dto.js";
import { db } from "@/clients/prisma.js";
import { supabase } from "@/clients/supabase.js";
import { Prisma } from "@db/generated/prisma/client.js";

export async function findUserById(id: string) {
  try {
    return await db.user.findUniqueOrThrow({
      where: { id }
    });
  } catch (err) {
    throw new Error("Failed to fetch user", { cause: err }); 
  }
}

export async function createUser(userData: CreateUserDto) {
  let authUserId: string | undefined; 
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password
    });
    if (error) throw error; 
    if (!data.user) throw new Error("Supabase returned no user during creation");
    authUserId = data.user.id;
    const newUser: Prisma.UserCreateInput = {
      id: authUserId,
      email: userData.email,
      displayName: userData.displayName ?? null,
      icon: userData.icon ?? null
    }; 
    const user = await db.user.create({ data: newUser });
    return user; 
  } catch (err) {
    if (authUserId) {
      try {
        await supabase.auth.admin.deleteUser(authUserId);
      } catch (cleanupErr) {
        console.error("Failed to delete orphan supabase user", cleanupErr); 
      }
    }
    throw new Error("Failed to create user", { cause: err }); 
  }
}

export async function updateUserById(id: string, data: UpdateUserDto) {
  try {
    return await db.user.update({
      where: { id }, 
      data
    });
  } catch (err) {
    throw new Error("Failed to update user", { cause: err }); 
  }
}

export async function deleteUserById(id: string) {
  try {
    return await db.user.delete({ where: { id } }); 
  } catch (err) {
    throw new Error("Failed to delete user", { cause: err });
  }
}