import { db } from "@/clients/prisma.js";

export async function findChatByGroupId(groupId: string) {
  try {
    return await db.chat.findUniqueOrThrow({
      where: { groupId }
    }); 
  } catch (err) {
    throw new Error("Failed to find group chat", { cause: err }); 
  }
}

export async function createChat(groupId: string) {
  try {
    return await db.chat.create({
      data: { groupId }
    }); 
  } catch (err) {
    throw new Error("Failed to crate group", { cause: err }); 
  }
}