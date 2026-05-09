import { CreateUserDto, UpdateUserDto } from "@/dtos/user/user.dto.js";
import { db } from "@/clients/prisma.js";

export async function findUserById(id: string) {
  return db.user.findUniqueOrThrow({
    where: { id }
  });
}

export async function createUser(userData: CreateUserDto) {
  return db.user.upsert({
    where: { id: userData.id },
    create: {
      id: userData.id,
      email: userData.email,
      displayName: userData.displayName ?? null,
      icon: userData.icon ?? null,
    },
    update: {
      email: userData.email,
      ...(userData.displayName !== undefined ? { displayName: userData.displayName } : {}),
      ...(userData.icon !== undefined ? { icon: userData.icon } : {}),
    },
  });
}

export async function updateUserById(id: string, data: UpdateUserDto) {
  return db.user.update({
    where: { id }, 
    data
  });
}

export async function deleteUserById(id: string) {
  return db.user.delete({ where: { id } });
}
