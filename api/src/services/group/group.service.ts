import { db } from "@/clients/prisma.js";
import { CreateGroupDto, UpdateGroupDto } from "@/dtos/group/group.dto.js";
import { Prisma } from "@db/generated/prisma/client.js";
import { nanoid } from "nanoid";

export async function findGroupsByUserId(userId: string) {
  return await db.group.findMany({
    where: {
      groupMembers: {
        some: { userId }
      }
    }
  })
}

export async function findGroupById(id: string) {
  return await db.group.findUniqueOrThrow({
      where: { id }
    })
}

export async function createGroup(userId: string, data: CreateGroupDto) {
  try {
      while (true) {
        try {
          const inviteCode = nanoid(8); 
          const newGroup: Prisma.GroupCreateInput = {
            ...data, 
            admin: { connect: { id: userId }},
            inviteCode 
          }
          return await db.group.create({ data: newGroup }); 
        } catch (err: any) {
          if (err.code === "P2002") {
            console.error("Failed to create group with duplicate code");
            continue;
          } else throw err; 
        }
      }
  } catch (err) {
    throw new Error("Failed to create group", { cause: err }); 
  }
}

export async function updateGroupById(id: string, data: UpdateGroupDto) {
  return await db.group.update({
    where: { id },
    data
  });
}

export async function deleteGroupById(id: string) {
  return await db.group.delete({
      where: { id }
    });
}