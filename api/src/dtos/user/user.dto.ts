import { User } from "@db/generated/prisma/client.js";

/* ---------------- REQUEST DTOS ---------------- */
interface UserDto {
  id: string;
  displayName?: string;
  email: string;
  icon?: string
}

export type CreateUserDto = UserDto;

export type UpdateUserDto = Partial<Omit<UserDto, "id" | "email">>;;

/* ---------------- RESPONSE DTOS ---------------- */
export type UserResponseDto = {
  id: string;
  displayName?: string;
  email: string;
  icon?: string;
}