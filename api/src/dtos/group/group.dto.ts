/* ---------------- REQUEST DTOS ---------------- */
export type CreateGroupDto = {
  name: string;
  eventDate?: Date;
}

export type UpdateGroupDto = {
  name?: string;
  eventDate?: Date;
}

/* ---------------- RESPONSE DTOS ---------------- */
export type GroupResponseDto = {
  id: string;
  name: string;
  eventDate?: Date;
  adminId: string;
  isLocked: boolean;
  createdAt: Date;
  inviteCode: number;
  inviteExpiresAt?: Date; 
}