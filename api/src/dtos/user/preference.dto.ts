/* ---------------- REQUEST DTOS ---------------- */
export type UpsertPreferenceDto = {
  dietary?: string;
  clothingSize?: string;
  notes?: string;
}

/* ---------------- RESPONSE DTOS ---------------- */
export type PreferenceResponseDto = {
  id: string;
  dietary?: string;
  clothingSize?: string;
  notes?: string;
}