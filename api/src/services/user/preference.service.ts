import { UpsertPreferenceDto } from "@/dtos/user/preference.dto.js";
import { db } from "@/clients/prisma.js";

export async function findPreferencesByUserId(userId: string) {
  try {
    return await db.preference.findUnique({
      where: { userId }
    }); 
  } catch (err) {
    throw new Error("Failed to fetch user preferences", { cause: err }); 
  }
}

export async function upsertPreferencesByUserId(userId: string, data: UpsertPreferenceDto) {
  try {
    return await db.preference.upsert({
      where: { userId },
      update: data,
      create: {
        user: { connect: { id: userId} },
        ...data
      }
    });
  } catch (err) {
    throw new Error("Failed to update user preferences", { cause: err }); 
  }
}
