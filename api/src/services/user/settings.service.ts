import { UpsertSettingsDto } from "@/dtos/user/settings.dto.js";
import { db } from "@/clients/prisma.js";

export async function findSettingsByUserId(userId: string) {
  return await db.settings.findUnique({
    where: { userId }
  });
}

export async function upsertSettingsByUserId(userId: string, data: UpsertSettingsDto) {
  return await db.settings.upsert({
    where: { userId },
    update: data,
    create: {
      user: { connect: { id: userId } },
      ...data
    }
  });
}