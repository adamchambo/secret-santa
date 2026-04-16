import { db } from "@/clients/prisma.js";

export async function findChatByGroupId(groupId: string) {
  return await db.chat.findUniqueOrThrow({
    where: { groupId }
  }); 
}

export async function createChat(groupId: string) {
  return await db.chat.create({
    data: { groupId }
  }); 
}