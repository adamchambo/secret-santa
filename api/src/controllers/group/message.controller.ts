import { CreateMessageDto } from "@/dtos/group/message.dto.js";
import { createMessageByGroupId, deleteMessageById, editMessageById, findMessagesByGroupId } from "@/services/group/message.service.js";
import { NextFunction, Request, Response } from "express";

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const groupId = req.params.groupId;
    if (!groupId || typeof groupId !== "string") return res.status(404).json({ error: "Request doesn't have a valid group id" });
     // add cursor pagination
    const messages = await findMessagesByGroupId(groupId);
    return res.json(messages);
  } catch (err) {
    next(err);
  }
}

export async function createMessage(req: Request, res: Response, next: NextFunction) { // restricted
  try {
    const memberId = req.user!.sub;
    const groupId = req.params.groupId;
    if (!groupId || typeof groupId !== "string") return res.status(404).json({ error: "Request doesn't have a valid group id" });
    const data: CreateMessageDto = req.body;
    const message = await createMessageByGroupId(memberId, groupId, data);
    return res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

export async function editMessage(req: Request, res: Response, next: NextFunction) { // restricted
  try {
    const messageId = req.params.messageId;
    if (!messageId || typeof messageId !== "string") return res.status(404).json({ error: "Request doesn't have a valid message id" });
    const data: CreateMessageDto = req.body;
    const message = await editMessageById(messageId, data);
    return res.json(message);
  } catch (err) {
    next(err);
  }
}

export async function deleteMessage(req: Request, res: Response, next: NextFunction) { // restricted
  try {
    const messageId = req.params.messageId;
    if (!messageId || typeof messageId !== "string") return res.status(404).json({ error: "Request doesn't have a valid message id" });
    await deleteMessageById(messageId);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

