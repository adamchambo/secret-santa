import { Router } from "express";
import { createUser, deleteUser, getUserById, updateUser } from "../controllers/user/user.controller.js";
import { createGiftOption, deleteGiftOptionById, getGiftOptionById, getGiftOptionsByUserId, updateGiftOptionById } from "../controllers/user/gift-option.controller.js";
import { getPreferencesByUserId, upsertPreferencesByUserId } from "../controllers/user/preference.controller.js";
import { getSettingsByUserId, upsertSettingsByUserId } from "../controllers/user/settings.controller.js";

export const userRouter = Router();

/* ---------------- USER ROUTERS ---------------- */
userRouter.get('/:userId', getUserById);
userRouter.post('/', createUser); 
userRouter.put('/:userId', updateUser)
userRouter.delete('/:userId', deleteUser); 

/* ---------------- CHILD ROUTERS ---------------- */
const giftRouter = Router({ mergeParams: true });
const preferenceRouter = Router({ mergeParams: true });
const settingsRouter = Router( { mergeParams: true }); 

/* ---------------- GIFT ROUTES ---------------- */
giftRouter.get('/', getGiftOptionsByUserId); 
giftRouter.get('/:giftOptionId', getGiftOptionById);
giftRouter.post('/', createGiftOption); 
giftRouter.put('/:giftOptionId', updateGiftOptionById);
giftRouter.delete('/:giftOptionId', deleteGiftOptionById); 

/* ---------------- PREFERENCE ROUTES ---------------- */
preferenceRouter.get('/', getPreferencesByUserId); 
preferenceRouter.put('/', upsertPreferencesByUserId); 

/* ---------------- SETTINGS ROUTES ---------------- */
settingsRouter.get('/', getSettingsByUserId); 
settingsRouter.put('/', upsertSettingsByUserId); 

/* ---------------- MOUNT CHILD ROUTERS ---------------- */
userRouter.use('/:userId/gift-options', giftRouter); 
userRouter.use('/:userId/preferences', preferenceRouter);
userRouter.use('/:userId/settings', settingsRouter); 