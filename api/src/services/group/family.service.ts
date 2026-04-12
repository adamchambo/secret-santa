import { db } from "@/clients/prisma.js";
import { CreateFamilyDto, UpdateFamilyDto } from "@/dtos/group/family.dto.js";

export async function findFamiliesByGroupId(groupId: string) {
  try {
    return await db.family.findMany({
      where: { groupId }
    });
  } catch (err) {
    throw new Error("Failed to fetch families for group", { cause: err }); 
  }
}

export async function createFamilyByGroupId(groupId: string, data: CreateFamilyDto) {
  try {
    return await db.family.create({
      data: {
        groupId,
        ...data
      }
    }); 
  } catch (err) {
    throw new Error("Failed to create family", { cause: err }); 
  }
}

export async function updateFamilyById(id: string, data: UpdateFamilyDto) {
  try {
    return await db.family.update({
      where: { id },
      data
    }); 
  } catch (err) {
    throw new Error("Failed to update family", { cause: err }); 
  }
}

export async function deleteFamilyById(id: string) {
  try {
    return await db.family.delete({
      where: { id }
    }); 
  } catch (err) {
    throw new Error("Failed to delete family", { cause: err }); 
  }
}