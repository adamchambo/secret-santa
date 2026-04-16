import { CreateGroupDto, UpdateGroupDto } from "@/dtos/group/group.dto.js";
import { findGroupById, findGroupsByUserId, createGroup as createGroupService, updateGroupById, deleteGroupById } from "@/services/group/group.service.js";
import { NextFunction, Request, Response } from "express";

export async function getGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const groups = await findGroupsByUserId(userId);
    return res.json(groups); 
  } catch (err) {
    next(err);
  }
}

export async function getGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.groupId;
    if (!id || typeof id !== "string") return res.status(404).json({ error: "Request doesn't have a valid group id" });
    const group = await findGroupById(id);
    if (!group) return res.status(500).json({ error: "Invalid group id" });
    return res.json(group); 
  } catch (err) {
    next(err);
  }
}

export async function createGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const data: CreateGroupDto = req.body;
    const group = await createGroupService(userId, data);
    if (!group) return res.status(400).json({ error: "Invalid group id" });
    return res.status(201).json(group); 
  } catch (err) {
    next(err);
  }
}

export async function updateGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.groupId;
    if (!id || typeof id !== "string") return res.status(404).json({ error: "Request doesn't have a valid group id" });
    const data: UpdateGroupDto = req.body;
    const group = await updateGroupById(id, data);
    if (!group) return res.status(400).json({ error: "Invalid group id" });
    return res.json(group);
  } catch (err) {
    next(err);
  }
}

export async function deleteGroup(req: Request, res: Response, next: NextFunction) {  
  try {
      const id = req.params.groupId;
      if (!id || typeof id !== "string") return res.status(404).json({ error: "Request doesn't have a valid group id" });
      await deleteGroupById(id);
      return res.status(204).send(); 
    } catch (err) {
      next(err);
    }
}
