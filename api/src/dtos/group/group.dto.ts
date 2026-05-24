/* ---------------- REQUEST DTOS ---------------- */
export type CreateGroupDto = {
  name: string;
  eventDate?: Date;
  budgetLimit?: number;
  description?: string;
  location?: string;
}

export type UpdateGroupDto = {
  name?: string;
  eventDate?: Date;
  budgetLimit?: number;
  description?: string;
  location?: string;
}

/* ---------------- RESPONSE DTOS ---------------- */
export type GroupResponseDto = {
  id: string;
  name: string;
  eventDate?: Date;
  budgetLimit?: number;
  description?: string;
  location?: string;
  adminId: string;
  isLocked: boolean;
  createdAt: Date;
  inviteCode: number;
  inviteExpiresAt?: Date; 
}
