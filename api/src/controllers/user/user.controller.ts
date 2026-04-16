import { CreateUserDto, UpdateUserDto } from "@/dtos/user/user.dto.js";
import { findUserById, createUser as createUserService, updateUserById, deleteUserById } from "@/services/user/user.service.js";
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

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body as CreateUserDto;
    if (!data.email || !data.password) 
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

