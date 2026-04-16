import { CreateGroupMemberDto, UpdateGroupMemberDto } from "@/dtos/group/group-member.dto.js";
import { findGroupMembersByGroupId, createGroupMemberByGroupId, updateGroupMemberById, deleteGroupMemberById } from "@/services/group/group-member.service.js";
import { NextFunction, Request, Response } from "express";

export async function getGroupMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const groupId = req.params.groupId;
    if (!groupId || typeof groupId !== "string") return res.status(404).json({ error: "Request doesn't have a valid group id" });
    const groupMembers = await findGroupMembersByGroupId(groupId);
    return res.json(groupMembers);
  } catch (err) {
    next(err);
  }
}

export async function createGroupMember(req: Request, res: Response, next: NextFunction) {
  try {
    const groupId = req.params.groupId;
    if (!groupId || typeof groupId !== "string") return res.status(404).json({ error: "Request doesn't have a valid group id" });
    const data: CreateGroupMemberDto = req.body;
    const groupMember = await createGroupMemberByGroupId(groupId, data);
    return res.status(201).json(groupMember); 
  } catch (err) {
    next(err);
  }
}

export async function updateGroupMember(req: Request, res: Response, next: NextFunction) {
  try {
    const memberId = req.params.memberId;
    if (!memberId || typeof memberId !== "string") return res.status(404).json({ error: "Request doesn't have a valid member id" });
    const data: UpdateGroupMemberDto = req.body;
    const groupMember = await updateGroupMemberById(memberId, data);
    return res.json(groupMember);
  } catch (err) {
    next(err);
  }
}

export async function deleteGroupMember(req: Request, res: Response, next: NextFunction) {
  try {
    const memberId = req.params.memberId;
    if (!memberId || typeof memberId !== "string") return res.status(404).json({ error: "Request doesn't have a valid member id" });
    await deleteGroupMemberById(memberId);
    return res.status(204).send(); 
  } catch (err) {
    next(err);
  }
}