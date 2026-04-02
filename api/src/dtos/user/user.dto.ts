/* ---------------- REQUEST DTOS ---------------- */
export type CreateUserDto = {
  displayName?: string;
  email: string;
  icon?: string
}

export type UpdateUserDto = {
  displayName?: string;
  email?: string;
  icon?: string;
}

/* ---------------- RESPONSE DTOS ---------------- */
export type UserResponseDto = {
  id: string;
  displayName?: string;
  email: string;
  icon?: string;
}