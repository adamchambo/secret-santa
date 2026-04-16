import { CreateGiftOptionDto, UpdateGiftOptionDto } from "@/dtos/user/gift-option.dto.js";
import { db } from "@/clients/prisma.js";
import { Prisma } from "@db/generated/prisma/client.js";

export async function findGiftOptionsByUserId(userId: string) {
  return await db.giftOption.findMany({ where: { userId } }); 
} 

export async function findGiftOptionById(id: string) {
  return db.giftOption.findUniqueOrThrow({
    where: { id }
  });
}

export async function createGiftOption(userId: string, data: CreateGiftOptionDto) {
  const newGiftOption: Prisma.GiftOptionCreateInput = {
    ...data,
    user: { connect: { id: userId }},
    takenByUser: false,
  };

  return db.giftOption.create({ data: newGiftOption });
}

export async function updateGiftOptionById(id: string, data: UpdateGiftOptionDto) {
  return db.giftOption.update({
    where: { id }, 
    data
  });
}

export async function deleteGiftOptionById(id: string) {
  return await db.giftOption.delete({
    where: { id }
  });
}