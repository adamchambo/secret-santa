/* ---------------- REQUEST DTOS ---------------- */
export type CreateGroupMemberDto = {
  userId: string;
}

export type UpdateGroupMemberDto = {
  familyId?: string;
  
}

/* ---------------- RESPONSE DTOS ---------------- */
export type GroupMemberResponseDto = {
  id: string;
  memberId: string;
  groupId: string;
  familyId?: string;
  joinedAt?: string; 
}