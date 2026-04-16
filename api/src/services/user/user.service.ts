import { CreateUserDto, UpdateUserDto } from "@/dtos/user/user.dto.js";
import { db } from "@/clients/prisma.js";
import { supabase } from "@/clients/supabase.js";
import { Prisma } from "@db/generated/prisma/client.js";

export async function findUserById(id: string) {
  return db.user.findUniqueOrThrow({
    where: { id }
  });
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
    throw err; 
  }
}

export async function updateUserById(id: string, data: UpdateUserDto) {
  return db.user.update({
    where: { id }, 
    data
  });
}

export async function deleteUserById(id: string) {
  return db.user.delete({ where: { id } });
}