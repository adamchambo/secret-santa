import { CreateUserDto, UpdateUserDto } from "../../dtos/user/user.dto.js";
import {
  findSharedUserProfile,
  findUserById,
  createUser as createUserService,
  updateUserById,
  deleteUserById,
} from "../../services/user/user.service.js";
import { NextFunction, Request, Response } from "express";

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.user!.sub; 
    const user = await findUserById(id);
    return res.json(user); 
  } catch (err) {
    next(err); 
  }
}

export async function getSharedProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const viewerUserId = req.user!.sub;
    const profileUserId = req.params.userId;
    if (!profileUserId || typeof profileUserId !== "string") {
      return res.status(404).json({ error: "Request doesn't have a valid user id" });
    }

    const profile = await findSharedUserProfile(viewerUserId, profileUserId);
    if (!profile) return res.status(403).json({ error: "Profile is not shared with you" });

    return res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body as CreateUserDto;
    if (!data.email || !data.id) 
      return res.status(400).json({ error: "Missing required fields" }); 
    const user = await createUserService(data);
    return res.status(201).json(user);  
  } catch (err) {
    next(err); 
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.user!.sub;
    const data = req.body as UpdateUserDto; 
    if (Object.keys(data).length === 0) 
      return res.status(400).json({ error: "At least one field must be populated" });
    const user = await updateUserById(id, data); 
    return res.json(user); 
  } catch (err) {
    next(err); 
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.user!.sub;
    await deleteUserById(id!); 
    return res.status(202).json({ message: "Successfully deleted user" }); 
  } catch (err) {
    next(err); 
  }
}
