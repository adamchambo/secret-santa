/* ---------------- REQUEST DTOS ---------------- */
export type CreateMessageDto = {
  content: string;
}

export type UpdateMessageDto = {
  content: string;
}

/* ---------------- RESPONSE DTOS ---------------- */
export type MessageResponseDto = {
  id: string;
  chatId: string;
  senderUserId: string;
  content: string;
  createdAt: Date;
  editedAt: Date;
}