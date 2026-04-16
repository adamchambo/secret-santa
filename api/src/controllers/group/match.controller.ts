import { createMatchesByGroupId, deleteMatchesByGroupId, findMatchesByGroupId } from "@/services/group/match.service.js";
import { NextFunction, Request, Response } from "express";

export async function getMatches(req: Request, res: Response, next: NextFunction) {
  try {
    const groupId = req.params.groupId;
    if (!groupId || typeof groupId !== "string") return res.status(404).json({ error: "Request doesn't have a valid group id" });
    const matches = findMatchesByGroupId(groupId);
    return res.json(matches);
  } catch (err) {
    next(err);
  }
}

export async function createMatches(req: Request, res: Response, next: NextFunction) {
  try {
    const groupId = req.params.groupId;
    if (!groupId || typeof groupId !== "string") return res.status(404).json({ error: "Request doesn't have a valid group id" });
    const matches = await createMatchesByGroupId(groupId);
    return res.status(201).json(matches);
  } catch (err) {
    next(err);
  }
}

export async function deleteMatches(req: Request, res: Response, next: NextFunction) {
  try {
    const groupId = req.params.groupId;
    if (!groupId || typeof groupId !== "string") return res.status(404).json({ error: "Request doesn't have a valid group id" });
    await deleteMatchesByGroupId(groupId);
    return res.status(204).json(groupId);
  } catch (err) {
    next(err);
  }
}
