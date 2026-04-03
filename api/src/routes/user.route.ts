import { Router } from "express";
import { createUser, deleteUser, getUser, updateUser } from "../controllers/user/user.controller.js";
import { createGiftOption, deleteGiftOption, getGiftOption, getGiftOptions, updateGiftOption } from "../controllers/user/gift-option.controller.js";
import { getPreferences, upsertPreferences } from "../controllers/user/preference.controller.js";
import { getSettings, upsertSettings } from "../controllers/user/settings.controller.js";
import { requireAuth } from "@/middleware/auth.middleware.js";

export const userRouter = Router();

/* ---------------- USER ROUTERS ---------------- */
userRouter.get('/:userId', requireAuth, getUser);
userRouter.post('/', createUser); 
userRouter.put('/:userId', requireAuth, updateUser)
userRouter.delete('/:userId', requireAuth, deleteUser); 

/* ---------------- CHILD ROUTERS ---------------- */
const giftRouter = Router({ mergeParams: true });
const preferenceRouter = Router({ mergeParams: true });
const settingsRouter = Router( { mergeParams: true }); 

/* ---------------- GIFT ROUTES ---------------- */
giftRouter.get('/', getGiftOptions); 
giftRouter.get('/:giftOptionId', getGiftOption);
giftRouter.post('/', createGiftOption); 
giftRouter.put('/:giftOptionId', updateGiftOption);
giftRouter.delete('/:giftOptionId', deleteGiftOption); 

/* ---------------- PREFERENCE ROUTES ---------------- */
preferenceRouter.get('/', getPreferences); 
preferenceRouter.put('/', upsertPreferences); 

/* ---------------- SETTINGS ROUTES ---------------- */
settingsRouter.get('/', getSettings); 
settingsRouter.put('/', upsertSettings); 

/* ---------------- MOUNT CHILD ROUTERS ---------------- */
userRouter.use('/:userId/gift-options', giftRouter); 
userRouter.use('/:userId/preferences', preferenceRouter);
userRouter.use('/:userId/settings', settingsRouter); 