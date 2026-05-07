import { Router } from "express";
import { createUser, deleteUser, getUser, updateUser } from "@/controllers/user/user.controller.js";
import { createGiftOption, deleteGiftOption, getGiftOption, getGiftOptions, updateGiftOption } from "@/controllers/user/gift-option.controller.js";
import { getPreferences, upsertPreferences } from "@/controllers/user/preference.controller.js";
import { getSettings, upsertSettings } from "@/controllers/user/settings.controller.js";
import { requireAuth, requireOwner, requireResourceOwner } from "@/middleware/auth.middleware.js";
import { findGiftOptionById } from "@/services/user/gift-option.service.js";

export const userRouter = Router();

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       required: [error]
 *       properties:
 *         error:
 *           type: string
 *     MessageResponse:
 *       type: object
 *       required: [message]
 *       properties:
 *         message:
 *           type: string
 *     CreateUser:
 *       type: object
 *       required: [id, email]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         displayName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         icon:
 *           type: string
 *     UpdateUser:
 *       type: object
 *       properties:
 *         displayName:
 *           type: string
 *         icon:
 *           type: string
 *     User:
 *       type: object
 *       required: [id, email]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         displayName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         icon:
 *           type: string
 *     CreateGiftOption:
 *       type: object
 *       required: [priority, name]
 *       properties:
 *         priority:
 *           type: integer
 *         name:
 *           type: string
 *         productUrl:
 *           type: string
 *           format: uri
 *     UpdateGiftOption:
 *       type: object
 *       properties:
 *         priority:
 *           type: integer
 *         name:
 *           type: string
 *         productUrl:
 *           type: string
 *           format: uri
 *     GiftOption:
 *       type: object
 *       required: [id, priority, name, takenByUser]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         priority:
 *           type: integer
 *         name:
 *           type: string
 *         productUrl:
 *           type: string
 *           format: uri
 *         takenByUser:
 *           type: boolean
 *     UpsertPreference:
 *       type: object
 *       properties:
 *         dietary:
 *           type: string
 *         clothingSize:
 *           type: string
 *         notes:
 *           type: string
 *     Preference:
 *       type: object
 *       required: [id]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         dietary:
 *           type: string
 *         clothingSize:
 *           type: string
 *         notes:
 *           type: string
 *     UpsertSettings:
 *       type: object
 *       properties:
 *         language:
 *           type: string
 *           enum: [EN, ES, FR]
 *         theme:
 *           type: string
 *           enum: [LIGHT, DARK]
 *         currency:
 *           type: string
 *           enum: [AUD, USD, EUR, GBP]
 *     Settings:
 *       type: object
 *       required: [id, language, theme, currency]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         language:
 *           type: string
 *           enum: [EN, ES, FR]
 *         theme:
 *           type: string
 *           enum: [LIGHT, DARK]
 *         currency:
 *           type: string
 *           enum: [AUD, USD, EUR, GBP]
 */

/* ---------------- USER ROUTERS ---------------- */
/* public */
/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post('/', createUser);
/* auth */
userRouter.use('/:userId', requireAuth, requireOwner)
/* protected */
/**
 * @openapi
 * /users/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Missing or invalid auth token
 *       403:
 *         description: Authenticated user does not own this resource
 */
userRouter.get('/:userId', getUser);
/**
 * @openapi
 * /users/{userId}:
 *   put:
 *     tags: [Users]
 *     summary: Update the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: No update fields supplied
 *       401:
 *         description: Missing or invalid auth token
 *       403:
 *         description: Authenticated user does not own this resource
 */
userRouter.put('/:userId', updateUser)
/**
 * @openapi
 * /users/{userId}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       202:
 *         description: User deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         description: Missing or invalid auth token
 *       403:
 *         description: Authenticated user does not own this resource
 */
userRouter.delete('/:userId', deleteUser); 

/* ---------------- CHILD ROUTERS ---------------- */
const giftRouter = Router({ mergeParams: true });
const preferenceRouter = Router({ mergeParams: true });
const settingsRouter = Router( { mergeParams: true }); 

/* ---------------- GIFT ROUTES ---------------- */
/**
 * @openapi
 * /users/{userId}/gift-options:
 *   get:
 *     tags: [Gift Options]
 *     summary: List gift options for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Gift options found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GiftOption'
 */
giftRouter.get('/', getGiftOptions); 
/**
 * @openapi
 * /users/{userId}/gift-options/{giftOptionId}:
 *   get:
 *     tags: [Gift Options]
 *     summary: Get a gift option
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: giftOptionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Gift option found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GiftOption'
 */
giftRouter.get('/:giftOptionId', getGiftOption);
/**
 * @openapi
 * /users/{userId}/gift-options:
 *   post:
 *     tags: [Gift Options]
 *     summary: Create a gift option
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGiftOption'
 *     responses:
 *       201:
 *         description: Gift option created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GiftOption'
 */
giftRouter.post('/', createGiftOption); 
/**
 * @openapi
 * /users/{userId}/gift-options/{giftOptionId}:
 *   put:
 *     tags: [Gift Options]
 *     summary: Update a gift option
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: giftOptionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGiftOption'
 *     responses:
 *       200:
 *         description: Gift option updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GiftOption'
 */
giftRouter.put('/:giftOptionId', requireResourceOwner(findGiftOptionById, "giftOptionId"), updateGiftOption);
/**
 * @openapi
 * /users/{userId}/gift-options/{giftOptionId}:
 *   delete:
 *     tags: [Gift Options]
 *     summary: Delete a gift option
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: giftOptionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       202:
 *         description: Gift option deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
giftRouter.delete('/:giftOptionId', requireResourceOwner(findGiftOptionById, "giftOptionId"), deleteGiftOption); 

/* ---------------- PREFERENCE ROUTES ---------------- */
/**
 * @openapi
 * /users/{userId}/preferences:
 *   get:
 *     tags: [Preferences]
 *     summary: Get user preferences
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Preferences found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Preference'
 */
preferenceRouter.get('/', getPreferences); 
/**
 * @openapi
 * /users/{userId}/preferences:
 *   put:
 *     tags: [Preferences]
 *     summary: Create or update user preferences
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpsertPreference'
 *     responses:
 *       200:
 *         description: Preferences saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Preference'
 */
preferenceRouter.put('/', upsertPreferences); 

/* ---------------- SETTINGS ROUTES ---------------- */
/**
 * @openapi
 * /users/{userId}/settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get user settings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Settings found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 */
settingsRouter.get('/', getSettings); 
/**
 * @openapi
 * /users/{userId}/settings:
 *   put:
 *     tags: [Settings]
 *     summary: Create or update user settings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpsertSettings'
 *     responses:
 *       200:
 *         description: Settings saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 */
settingsRouter.put('/', upsertSettings); 

/* ---------------- MOUNT CHILD ROUTERS ---------------- */
userRouter.use('/:userId/gift-options', giftRouter); 
userRouter.use('/:userId/preferences', preferenceRouter);
userRouter.use('/:userId/settings', settingsRouter); 
