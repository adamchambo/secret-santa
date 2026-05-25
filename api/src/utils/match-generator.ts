// @ts-ignore - Prisma is generated outside the API rootDir but emits runtime JS.
import { GroupMember } from "../../../db/generated/prisma/client.js";

type GeneratedMatch = {
  givingUserId: string;
  receivingUserId: string;
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function isSameFamilyMatch(giver: GroupMember, receiver: GroupMember) {
  return Boolean(giver.familyId && receiver.familyId && giver.familyId === receiver.familyId);
}

export function generateMatches(members: GroupMember[]): GeneratedMatch[] {
  if (members.length < 2) {
    throw new Error("At least two group members are required to generate matches");
  }

  let bestMatches: GeneratedMatch[] | null = null;
  let lowestFamilyConflicts = Number.POSITIVE_INFINITY;

  for (let attempt = 0; attempt < 2000; attempt++) {
    const receivers = shuffle(members);
    const matches: GeneratedMatch[] = [];
    let familyConflicts = 0;
    let hasSelfMatch = false;

    members.forEach((giver, index) => {
      const receiver = receivers[index];
      if (!receiver || giver.userId === receiver.userId) {
        hasSelfMatch = true;
        return;
      }

      if (isSameFamilyMatch(giver, receiver)) familyConflicts++;

      matches.push({
        givingUserId: giver.userId,
        receivingUserId: receiver.userId,
      });
    });

    if (hasSelfMatch || matches.length !== members.length) continue;
    if (familyConflicts === 0) return matches;

    if (familyConflicts < lowestFamilyConflicts) {
      lowestFamilyConflicts = familyConflicts;
      bestMatches = matches;
    }
  }

  if (bestMatches) {
    return bestMatches;
  }

  for (let offset = 1; offset < members.length; offset++) {
    const matches = members.map((giver, index) => {
      const receiver = members[(index + offset) % members.length]!;

      return {
        givingUserId: giver.userId,
        receivingUserId: receiver.userId,
      };
    });

    if (matches.every((match) => match.givingUserId !== match.receivingUserId)) {
      return matches;
    }
  }

  throw new Error("Unable to generate valid matches");
}
