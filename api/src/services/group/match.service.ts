import { db } from "@/clients/prisma.js";
import { findGroupMembersByGroupId } from "./group-member.service.js";
import { generateMatches } from "@/utils/match-generator.js";

export async function findMatchesByGroupId(groupId: string) {
  try {
    return await db.match.findMany({
      where: { groupId }
    }); 
  } catch (err) {
    throw new Error("Failed to fetch group matches", { cause: err }); 
  }
}

export async function createMatchesByGroupId(groupId: string) {
  try {
    await deleteMatchesByGroupId(groupId); 
    const groupMembers = await findGroupMembersByGroupId(groupId);
    const matches = generateMatches(groupMembers); 
    return await db.match.createMany({
      data: matches.map(m => ({
        groupId,
        ...m
      }))
    });
  } catch (err) {
    throw new Error("Failed to create matches", { cause: err }); 
  }
}

export async function deleteMatchesByGroupId(groupId: string) {
  try {
    return await db.match.deleteMany({
      where: { groupId }
    })
  } catch (err) {
    throw new Error("", { cause: err }); 
  }
}