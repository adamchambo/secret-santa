import { UpsertSettingsDto } from "@/dtos/user/settings.dto.js";
import { db } from "@/clients/prisma.js";

export async function findSettingsByUserId(userId: string) {
  try {
    return await db.settings.findUnique({
      where: { userId }
    });
  } catch (err) {
    throw new Error("Failed to find user settings", { cause: err }); 
  }
}

export async function upsertSettingsByUserId(userId: string, data: UpsertSettingsDto) {
  try {
    return await db.settings.upsert({
      where: { userId },
      update: data,
      create: {
        user: { connect: { id: userId } },
        ...data
      }
    });
  } catch (err) {
    throw new Error("Failed to update or create user settings", { cause: err }); 
  }
}