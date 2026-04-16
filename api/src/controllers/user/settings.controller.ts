import { UpsertSettingsDto } from "@/dtos/user/settings.dto.js";
import { findSettingsByUserId, upsertSettingsByUserId } from "@/services/user/settings.service.js";
import { Request, Response, NextFunction } from "express";

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const settings = await findSettingsByUserId(userId);
    return res.json(settings);
  } catch (err) {
    next(err); 
  }
}

export async function upsertSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const data: UpsertSettingsDto = req.body;
    const settings = await upsertSettingsByUserId(userId, data);
    return res.json(settings);
  } catch (err) {
    next(err); 
  }
}