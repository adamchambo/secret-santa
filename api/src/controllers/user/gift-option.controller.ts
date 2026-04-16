import { CreateGiftOptionDto, UpdateGiftOptionDto } from "@/dtos/user/gift-option.dto.js";
import { findGiftOptionById, findGiftOptionsByUserId, createGiftOption as createGiftOptionService, updateGiftOptionById, deleteGiftOptionById } from "@/services/user/gift-option.service.js";
import { NextFunction, Request, Response } from "express";

export async function getGiftOptions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub; 
    const giftOptions = await findGiftOptionsByUserId(userId);
    return res.json(giftOptions)
  } catch (err) {
    throw err; 
  }
}

export async function getGiftOption(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params; 
    if (!id || typeof id !== "string") return res.status(404).json({ error: "Invalid resource id" }); 
    const giftoption = await findGiftOptionById(id); 
    return res.json(giftoption);
  } catch (err) {
    throw err; 
  }
}

export async function createGiftOption(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub; 
    const data: CreateGiftOptionDto = req.body;
    const giftOption = await createGiftOptionService(userId, data);
    return res.status(201).json(giftOption); 
  } catch (err) {
    throw err; 
  }
}

export async function updateGiftOption(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params; 
    if (!id || typeof id !== "string") return res.status(404).json({ error: "Invalid resource id" });  
    const data: UpdateGiftOptionDto = req.body;
    if (Object.keys(data).length === 0) 
      return res.status(400).json({ error: "At least one field must be populated" });
    const giftOption = await updateGiftOptionById(id, data);
    return res.json(giftOption); 
  } catch (err) {
    throw err; 
  }
}

export async function deleteGiftOption(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params; 
    if (!id || typeof id !== "string") return res.status(404).json({ error: "Invalid resource id" });  
    await deleteGiftOptionById(id);
    return res.status(202).json({ message: "Successfully deleted gift option" }); 
  } catch (err) {
    throw err; 
  }
}

