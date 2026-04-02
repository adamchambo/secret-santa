/* ---------------- REQUEST DTOS ---------------- */
export type CreateFamilyDto = {
  name: string;
}

export type UpdateFamilyDto = {
  name?: string;
}
/* ---------------- RESPONSE DTOS ---------------- */
export type FamilyResponseDto = {
  id: string;
  groupId: string;
  name: string;
}