/* ---------------- RESPONSE DTOS ---------------- */
export type MatchResponseDto = {
  id: string;
  groupId: string;
  givingUserId: string;
  receivingUserId: string;
  createdAt: Date;
}