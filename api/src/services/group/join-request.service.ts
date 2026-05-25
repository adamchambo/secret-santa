import { db } from "../../clients/prisma.js";

export async function findGroupByInviteCode(inviteCode: string) {
  const normalisedInviteCode = inviteCode.trim().toUpperCase();
  return db.group.findUnique({
    where: { inviteCode: normalisedInviteCode },
  });
}

export async function findJoinRequestsByGroupId(groupId: string) {
  return db.joinRequest.findMany({
    where: { groupId },
    include: {
      user: true,
    },
    orderBy: { requestedAt: "asc" },
  });
}

export async function createJoinRequestByInviteCode(userId: string, inviteCode: string) {
  const group = await findGroupByInviteCode(inviteCode);
  if (!group) return null;

  const existingMember = await db.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId: group.id,
      },
    },
  });
  if (existingMember) return { status: "already-member" as const, group };

  const request = await db.joinRequest.upsert({
    where: {
      userId_groupId: {
        userId,
        groupId: group.id,
      },
    },
    create: {
      userId,
      groupId: group.id,
    },
    update: {},
  });

  return { status: "requested" as const, group, request };
}

export async function acceptJoinRequestById(groupId: string, requestId: string) {
  return db.$transaction(async (tx) => {
    const request = await tx.joinRequest.findUniqueOrThrow({
      where: { id: requestId },
    });
    if (request.groupId !== groupId) throw new Error("Join request does not belong to this group");

    const member = await tx.groupMember.upsert({
      where: {
        userId_groupId: {
          userId: request.userId,
          groupId: request.groupId,
        },
      },
      create: {
        userId: request.userId,
        groupId: request.groupId,
      },
      update: {},
    });

    await tx.joinRequest.delete({ where: { id: requestId } });
    return member;
  });
}

export async function deleteJoinRequestById(groupId: string, requestId: string) {
  const request = await db.joinRequest.findUniqueOrThrow({ where: { id: requestId } });
  if (request.groupId !== groupId) throw new Error("Join request does not belong to this group");
  return db.joinRequest.delete({ where: { id: requestId } });
}
