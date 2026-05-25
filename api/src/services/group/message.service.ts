import {
  CreateMessageDto,
  UpdateMessageDto,
} from "../../dtos/group/message.dto.js";
import { db } from "../../clients/prisma.js";

export async function findMessageById(messageId: string) {
  return db.message.findUnique({
    where: { id: messageId },
  });
}

export async function findMessagesByGroupId(groupId: string) {
  return await db.message.findMany({
    where: {
      chat: {
        groupId,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      senderUser: true,
    },
  });
}


export async function createMessageByGroupId(
  userId: string,
  groupId: string,
  data: CreateMessageDto,
) {
  const chat = await db.chat.upsert({
    where: { groupId },
    update: {},
    create: {
      group: { connect: { id: groupId } },
    },
  });

  return await db.message.create({
    data: {
      chat: { connect: { id: chat.id } },
      senderUser: { connect: { id: userId } },
      content: data.content,
    },
    include: {
      senderUser: true,
    },
  });
}

export async function editMessageById(id: string, data: UpdateMessageDto) {
  return await db.message.update({
    where: { id },
    data,
  });
}

export async function deleteMessageById(id: string) {
  return await db.message.delete({
    where: { id },
  });
}
