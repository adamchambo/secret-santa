import { UpsertPreferenceDto } from "@/dtos/user/preference.dto.js";
import { db } from "@/clients/prisma.js";

export async function findPreferencesByUserId(userId: string) {
  return db.preference.findUnique({
    where: { userId }
  });
}
export async function upsertPreferencesByUserId(userId: string, data: UpsertPreferenceDto) {
  return await db.preference.upsert({
    where: { userId },
    update: data,
    create: {
      user: { connect: { id: userId} },
      ...data
    }
  });
}
