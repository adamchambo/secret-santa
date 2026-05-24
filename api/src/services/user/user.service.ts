import { CreateUserDto, UpdateUserDto } from "@/dtos/user/user.dto.js";
import { db } from "@/clients/prisma.js";

export async function findUserById(id: string) {
  return db.user.findUniqueOrThrow({
    where: { id }
  });
}

export async function findSharedUserProfile(viewerUserId: string, profileUserId: string) {
  const canViewProfile =
    viewerUserId === profileUserId ||
    (await db.groupMember.count({
      where: {
        userId: profileUserId,
        group: {
          groupMembers: {
            some: { userId: viewerUserId },
          },
        },
      },
    })) > 0;

  if (!canViewProfile) return null;

  const [user, giftOptions, preferences, activeGroupCount] = await Promise.all([
    db.user.findUnique({
      where: { id: profileUserId },
    }),
    db.giftOption.findMany({
      where: { userId: profileUserId },
      orderBy: { priority: "asc" },
    }),
    db.preference.findUnique({
      where: { userId: profileUserId },
    }),
    db.groupMember.count({
      where: { userId: profileUserId },
    }),
  ]);

  if (!user) return null;

  return {
    user,
    giftOptions,
    preferences,
    activeGroupCount,
  };
}

export async function createUser(userData: CreateUserDto) {
  return db.user.upsert({
    where: { id: userData.id },
    create: {
      id: userData.id,
      email: userData.email,
      displayName: userData.displayName ?? null,
      icon: userData.icon ?? null,
      description: userData.description ?? null,
    },
    update: {
      email: userData.email,
      ...(userData.displayName !== undefined ? { displayName: userData.displayName } : {}),
      ...(userData.icon !== undefined ? { icon: userData.icon } : {}),
      ...(userData.description !== undefined ? { description: userData.description } : {}),
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
