import { CreateMessageDto, UpdateMessageDto } from "@/dtos/group/message.dto.js";
import { db } from "@/clients/prisma.js";

export async function findMessagesByGroupId(groupId: string) {
  try {
    return await db.message.findMany({
      where: {
        chat: {
          groupId
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });
  } catch (err) {
    throw new Error("Failed to fetch group messages", { cause: err }); 
  }
}

export async function findMessageById(id: string) {
  try {
    return db.message.findUnique({
      where: { id }
    })
  } catch {
    throw new Error("Failed to fetch message"); 
  }
}

export async function createMessageByGroupId(userId: string, groupId: string, data: CreateMessageDto) {
  try {
    return await db.message.create({
      data: {
        chat: { connect: { groupId }},
        senderUser: { connect: { id: userId}},
        content: data.content
      }
    });
  } catch (err) {
    throw new Error("Failed to create message", { cause: err }); 
  }
}

export async function editMessageById(id: string, data: UpdateMessageDto) {
  try {
    return await db.message.update({
      where: { id },
      data
    });
  } catch (err) {
    throw new Error("Failed to update message", { cause: err }); 
  }
}

export async function deleteMessageById(id: string) {
  try {
    return await db.message.delete({
      where: { id }
    }); 
  } catch (err) {
    throw new Error("Failed to delete message", { cause: err }); 
  }
}