import { CreateGroupMemberDto, UpdateGroupMemberDto } from "@/dtos/group/group-member.dto.js";
import { db } from "@/clients/prisma.js";

export async function findGroupMemberByUserId(userId: string, groupId: string) {
  return await db.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId
      }
    }
  });
} 

export async function findGroupMembersByGroupId(groupId: string) {
  return await db.groupMember.findMany({
    where: { id: groupId }
  });
}

export async function createGroupMemberByGroupId(groupId: string, data: CreateGroupMemberDto) {
  return await db.groupMember.create({
    data: {
      userId: data.userId,
      groupId
    }
  });
}

export async function updateGroupMemberById(id: string, data: UpdateGroupMemberDto) {
  return await db.groupMember.update({
    where: { id },
    data
  });
}

export async function deleteGroupMemberById(id: string) {
  return await db.groupMember.delete({
    where: { id }
  }); 
}