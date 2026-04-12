import { GroupMember } from "@db/generated/prisma/client.js";

type GeneratedMatch = {
  givingUserId: string,
  receivingUserId: string;
}

export function generateMatches(members: GroupMember[]): GeneratedMatch[] {
  members.sort(() => Math.random() - 0.5);
  const randomisedMembers: GroupMember[] = []; 
  const matches: GeneratedMatch[] = [];
  const familyMap: Record<string, GroupMember[]> = {};
  
  members.forEach(member => {
    const key = member.familyId ?? "NO_FAMILY";
    (familyMap[key] ??= []).push(member);
  });

  const keys = Object.keys(familyMap);

  let prevKey;
  while (keys.length > 0) {
    const randomKey = keys[Math.floor(Math.random() * keys.length)]!; 
    if (familyMap[randomKey]?.length === 0) continue;
    if (prevKey !== undefined && prevKey === randomKey && keys.length > 1) continue; 

    const member = familyMap[randomKey]?.pop();
    if (!member) continue; 
    matches.push(member);

    if (familyMap[randomKey]?.length === 0) {
      const index = keys.indexOf(randomKey);
      if (index !== -1) keys.splice(index, 1); 
    }
    prevKey = randomKey; 
  }

  for (let i = 0; i < randomisedMembers.length; i++) {
    const givingUserId = randomisedMembers[i].id;
    const receivingUserId = randomisedMembers[(i+1) % randomisedMembers.length].id;
    const match = {
      givingUserId,
      receivingUserId 
    }
    matches.push(match); 
  }

  return matches; 
}