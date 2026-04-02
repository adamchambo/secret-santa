import { Currency, Language, Theme } from "../../../../db/generated/prisma/enums.js";

/* ---------------- REQUEST DTOS ---------------- */
export type UpsertSettingsDto = {
  language?: Language;
  theme?: Theme;
  currency?: Currency;
}

/* ---------------- RESPONSE DTOS ---------------- */
export type SettingsResponseDto = {
  id: string;
  language: Language;
  theme: Theme;
  currency: Currency;
}