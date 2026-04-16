import { UpsertPreferenceDto } from "@/dtos/user/preference.dto.js";
import { findPreferencesByUserId, upsertPreferencesByUserId } from "@/services/user/preference.service.js";
import { Request, Response, NextFunction } from "express";

export async function getPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const preferences = await findPreferencesByUserId(userId);
    return res.json(preferences);
  } catch (err) {
    next(err); 
  }
}

export async function upsertPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const data: UpsertPreferenceDto = req.body;
    const preferences = await upsertPreferencesByUserId(userId, data);
    return res.json(preferences);
  } catch (err) {
    next(err); 
  }
}
