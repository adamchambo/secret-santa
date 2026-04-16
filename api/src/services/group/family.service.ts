import { db } from "@/clients/prisma.js";
import { CreateFamilyDto, UpdateFamilyDto } from "@/dtos/group/family.dto.js";

export async function findFamiliesByGroupId(groupId: string) {
  return await db.family.findMany({
    where: { groupId }
  });
}

export async function createFamilyByGroupId(groupId: string, data: CreateFamilyDto) {
  return await db.family.create({
    data: {
      groupId,
      ...data
    }
  }); 
}

export async function updateFamilyById(id: string, data: UpdateFamilyDto) {
  return await db.family.update({
    where: { id },
    data
  }); 
}

export async function deleteFamilyById(id: string) {
  return await db.family.delete({
    where: { id }
  }); 
}