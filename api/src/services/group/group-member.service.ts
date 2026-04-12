import { CreateGroupMemberDto, UpdateMemberDto } from "@/dtos/group/group-member.dto.js";
import { db } from "@/clients/prisma.js";

export async function findGroupMemberByUserId(userId: string, groupId: string) {
  try {
    return await db.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });
  } catch {
    throw new Error("Failed to fetch group member")
  }
}

export async function findGroupMembersByGroupId(groupId: string) {
  try {
    return await db.groupMember.findMany({
      where: { id: groupId }
    });
  } catch (err) {
    throw new Error("Failed to find group members", { cause: err });
  }
}

export async function createGroupMemberByGroupId(groupId: string, data: CreateGroupMemberDto) {
  try {
    return await db.groupMember.create({
      data: {
        userId: data.userId,
        groupId
      }
    });
  } catch (err) {
    throw new Error("", { cause: err });
  }
}

export async function updateGroupMemberById(id: string, data: UpdateMemberDto) {
  try {
    return await db.groupMember.update({
      where: { id },
      data
    });
  } catch (err) {
    throw new Error("Failed to update group member", { cause: err });
  }
}

export async function deleteGroupMemberById(id: string) {
  try {
    return await db.groupMember.delete({
      where: { id }
    }); 
  } catch (err) {
    throw new Error("Failed to delete group member", { cause: err });
  }
}