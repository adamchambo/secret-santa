import { CreateFamilyDto, UpdateFamilyDto } from "@/dtos/group/family.dto.js";
import { createFamilyByGroupId, deleteFamilyById, findFamiliesByGroupId, updateFamilyById } from "@/services/group/family.service.js";
import { NextFunction, Request, Response } from "express";

export async function getFamilies(req: Request, res: Response, next: NextFunction) {
  try {
    const groupId = req.params.groupId;
    if (!groupId || typeof groupId !== "string") return res.status(404).json({ error: "Request doesn't have a valid group id" });
    const families = await findFamiliesByGroupId(groupId);
    return res.json(families);
  } catch (err) {
    next(err);
  }
}

export async function createFamily(req: Request, res: Response, next: NextFunction) {
  try {
    const groupId = req.params.groupId;
    if (!groupId || typeof groupId !== "string") return res.status(404).json({ error: "Request doesn't have a valid group id" });
    const data: CreateFamilyDto = req.body;
    const family = await createFamilyByGroupId(groupId, data);
    return res.status(201).json(family);
  } catch (err) {
    next(err);
  }
}

export async function updateFamily(req: Request, res: Response, next: NextFunction) {
  try {
    const familyId = req.params.familyId;
    if (!familyId || typeof familyId !== "string") return res.status(404).json({ error: "Request doesn't have a valid family id" });
    const data: UpdateFamilyDto = req.body;
    const family = await updateFamilyById(familyId, data);
    return res.json(family);
  } catch (err) {
    next(err);
  }
}

export async function deleteFamily(req: Request, res: Response, next: NextFunction) {
  try {
    const familyId = req.params.familyId;
    if (!familyId || typeof familyId !== "string") return res.status(404).json({ error: "Request doesn't have a valid family id" });
    await deleteFamilyById(familyId);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
