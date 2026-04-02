/* ---------------- REQUEST DTOS ---------------- */
export type CreateGiftOptionDto = {
  priority: number;
  name: string;
  productUrl?: string;
}

export type UpdateGiftOptionDto = {
  priority?: number;
  name?: string;
  productUrl?: string;
}

/* ---------------- RESPONSE DTOS ---------------- */
export type GiftOptionResponseDto = {
  id: string;
  priority: number;
  name: string;
  productUrl?: string;
  takenByUser: boolean; 
}