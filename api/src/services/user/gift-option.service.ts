import { CreateGiftOptionDto, UpdateGiftOptionDto } from "@/dtos/user/gift-option.dto.js";
import { db } from "@/clients/prisma.js";
import { Prisma } from "@db/generated/prisma/client.js";

export async function findGiftOptionsByUserId(userId: string) {
  try {
    return await db.giftOption.findMany({ where: { userId } }); 
  } catch (err) {
    throw new Error("Failed to fetch user gift options", { cause: err }); 
  }
}

export async function findGiftOptionById(id: string) {
  try {
    return await db.giftOption.findUniqueOrThrow({
      where: { id }
    });
  } catch  {
    throw new Error("Failed to fetch gift option");
  }
}

export async function createGiftOption(userId: string, data: CreateGiftOptionDto) {
  try {
    const newGiftOption: Prisma.GiftOptionCreateInput = {
      ...data,
      user: { connect: { id: userId }},
      takenByUser: false,
    }
    return await db.giftOption.create({ data: newGiftOption });
  } catch (err) {
    throw new Error("Failed to create gift option", { cause: err }); 
  }
}

export async function updateGiftOptionById(id: string, data: UpdateGiftOptionDto) {
  try {
    return await db.giftOption.update({
      where: { id }, 
      data
    });
  } catch (err) {
    throw new Error("Failed to update gift option", { cause: err }); 
  }
}

export async function deleteGiftOptionById(id: string) {
  try {
    return await db.giftOption.delete({
      where: { id }
    });
  } catch (err) {
    throw new Error("Failed to delete gift option", { cause: err }); 
  }
}