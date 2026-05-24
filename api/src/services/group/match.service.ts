import { db } from "@/clients/prisma.js";
import { findGroupMembersByGroupId } from "./group-member.service.js";
import { generateMatches } from "@/utils/match-generator.js";

export async function findMatchesByGroupId(groupId: string) {
  return await db.match.findMany({
    where: { groupId }
  }); 
}

export async function createMatchesByGroupId(groupId: string) {
  try {
    const groupMembers = await findGroupMembersByGroupId(groupId);
    const matches = generateMatches(groupMembers); 

    await db.$transaction(async (transaction) => {
      await transaction.match.deleteMany({
        where: { groupId },
      });
      await transaction.match.createMany({
        data: matches.map(m => ({
          groupId,
          ...m
        }))
      });
      await transaction.group.update({
        where: { id: groupId },
        data: { isLocked: true },
      });
    });

    return await findMatchesByGroupId(groupId);
  } catch (err) {
    throw err; 
  }
}

export async function deleteMatchesByGroupId(groupId: string) {
  return await db.$transaction(async (transaction) => {
    const deletedMatches = await transaction.match.deleteMany({
      where: { groupId }
    });
    await transaction.group.update({
      where: { id: groupId },
      data: { isLocked: false },
    });
    return deletedMatches;
  });
}
