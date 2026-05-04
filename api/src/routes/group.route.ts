import { Router } from "express";
import {
  createGroup,
  deleteGroup,
  getGroup,
  getGroups,
  updateGroup,
} from "../controllers/group/group.controller.js";
import {
  createGroupMember,
  deleteGroupMember,
  getGroupMembers,
  updateGroupMember,
} from "../controllers/group/group-member.controller.js";
import {
  createFamily,
  deleteFamily,
  getFamilies,
  updateFamily,
} from "../controllers/group/family.controller.js";
import {
  createMatches,
  deleteMatches,
  getMatches,
} from "../controllers/group/match.controller.js";
import {
  createMessage,
  deleteMessage,
  editMessage,
  getMessage,
  getMessages,
} from "../controllers/group/message.controller.js";
import {
  requireAuth,
  requireGroupAdmin,
  requireGroupMember,
  requireResourceOwner,
} from "@/middleware/auth.middleware.js";
import { findMessageById } from "@/services/group/message.service.js";

export const groupRouter = Router();
groupRouter.use(requireAuth);

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateGroup:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *         eventDate:
 *           type: string
 *           format: date-time
 *     UpdateGroup:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         eventDate:
 *           type: string
 *           format: date-time
 *     Group:
 *       type: object
 *       required: [id, name, adminId, isLocked, createdAt, inviteCode]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         eventDate:
 *           type: string
 *           format: date-time
 *         adminId:
 *           type: string
 *           format: uuid
 *         isLocked:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         inviteCode:
 *           type: string
 *         inviteExpiresAt:
 *           type: string
 *           format: date-time
 *     CreateGroupMember:
 *       type: object
 *       required: [userId]
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *     UpdateGroupMember:
 *       type: object
 *       properties:
 *         familyId:
 *           type: string
 *           format: uuid
 *     GroupMember:
 *       type: object
 *       required: [id, memberId, groupId]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         memberId:
 *           type: string
 *           format: uuid
 *         groupId:
 *           type: string
 *           format: uuid
 *         familyId:
 *           type: string
 *           format: uuid
 *         joinedAt:
 *           type: string
 *           format: date-time
 *     CreateFamily:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *     UpdateFamily:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *     Family:
 *       type: object
 *       required: [id, groupId, name]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         groupId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *     Match:
 *       type: object
 *       required: [id, groupId, givingUserId, receivingUserId, createdAt]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         groupId:
 *           type: string
 *           format: uuid
 *         givingUserId:
 *           type: string
 *           format: uuid
 *         receivingUserId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateMessage:
 *       type: object
 *       required: [content]
 *       properties:
 *         content:
 *           type: string
 *           maxLength: 2000
 *     UpdateMessage:
 *       type: object
 *       required: [content]
 *       properties:
 *         content:
 *           type: string
 *           maxLength: 2000
 *     ChatMessage:
 *       type: object
 *       required: [id, chatId, senderUserId, content, createdAt, editedAt]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         chatId:
 *           type: string
 *           format: uuid
 *         senderUserId:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         editedAt:
 *           type: string
 *           format: date-time
 */

/* ---------------- GROUP ROUTES ---------------- */
/**
 * @openapi
 * /groups:
 *   get:
 *     tags: [Groups]
 *     summary: List groups for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Groups found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *       401:
 *         description: Missing or invalid auth token
 */
groupRouter.get("/", getGroups); // use query param
/**
 * @openapi
 * /groups/{groupId}:
 *   get:
 *     tags: [Groups]
 *     summary: Get a group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Group found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       404:
 *         description: Invalid group id
 */
groupRouter.get("/:groupId", getGroup);
/**
 * @openapi
 * /groups:
 *   post:
 *     tags: [Groups]
 *     summary: Create a group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGroup'
 *     responses:
 *       201:
 *         description: Group created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Invalid group data
 */
groupRouter.post("/", createGroup);
/**
 * @openapi
 * /groups/{groupId}:
 *   put:
 *     tags: [Groups]
 *     summary: Update a group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGroup'
 *     responses:
 *       200:
 *         description: Group updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       403:
 *         description: Authenticated user is not the group admin
 */
groupRouter.put("/:groupId", requireGroupAdmin, updateGroup);
/**
 * @openapi
 * /groups/{groupId}:
 *   delete:
 *     tags: [Groups]
 *     summary: Delete a group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Group deleted
 *       403:
 *         description: Authenticated user is not the group admin
 */
groupRouter.delete("/:groupId", requireGroupAdmin, deleteGroup);

/* ---------------- CHILD ROUTERS ---------------- */
const memberRouter = Router({ mergeParams: true });
const familyRouter = Router({ mergeParams: true });
const matchRouter = Router({ mergeParams: true });
const messageRouter = Router({ mergeParams: true });

/* ---------------- GROUP MEMBER ROUTES ---------------- */
/**
 * @openapi
 * /groups/{groupId}/members:
 *   get:
 *     tags: [Group Members]
 *     summary: List group members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Group members found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GroupMember'
 */
memberRouter.get("/", getGroupMembers);
/**
 * @openapi
 * /groups/{groupId}/members:
 *   post:
 *     tags: [Group Members]
 *     summary: Add a group member
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGroupMember'
 *     responses:
 *       201:
 *         description: Group member added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupMember'
 */
memberRouter.post("/", createGroupMember);
/**
 * @openapi
 * /groups/{groupId}/members/{memberId}:
 *   put:
 *     tags: [Group Members]
 *     summary: Update a group member
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGroupMember'
 *     responses:
 *       200:
 *         description: Group member updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupMember'
 */
memberRouter.put("/:memberId", updateGroupMember);
/**
 * @openapi
 * /groups/{groupId}/members/{memberId}:
 *   delete:
 *     tags: [Group Members]
 *     summary: Remove a group member
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Group member removed
 */
memberRouter.delete("/:memberId", deleteGroupMember);

/* ---------------- FAMILY ROUTES ---------------- */
/**
 * @openapi
 * /groups/{groupId}/families:
 *   get:
 *     tags: [Families]
 *     summary: List families in a group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Families found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Family'
 */
familyRouter.get("/", getFamilies);
/**
 * @openapi
 * /groups/{groupId}/families:
 *   post:
 *     tags: [Families]
 *     summary: Create a family
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFamily'
 *     responses:
 *       201:
 *         description: Family created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Family'
 *       403:
 *         description: Authenticated user is not the group admin
 */
familyRouter.post("/", requireGroupAdmin, createFamily);
/**
 * @openapi
 * /groups/{groupId}/families/{familyId}:
 *   put:
 *     tags: [Families]
 *     summary: Update a family
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFamily'
 *     responses:
 *       200:
 *         description: Family updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Family'
 */
familyRouter.put("/:familyId", requireGroupAdmin, updateFamily);
/**
 * @openapi
 * /groups/{groupId}/families/{familyId}:
 *   delete:
 *     tags: [Families]
 *     summary: Delete a family
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Family deleted
 */
familyRouter.delete("/:familyId", requireGroupAdmin, deleteFamily);

/* ---------------- MATCH ROUTES ---------------- */
/**
 * @openapi
 * /groups/{groupId}/matches:
 *   get:
 *     tags: [Matches]
 *     summary: List group matches
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Matches found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 */
matchRouter.get("/", getMatches);
/**
 * @openapi
 * /groups/{groupId}/matches:
 *   post:
 *     tags: [Matches]
 *     summary: Generate group matches
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Matches generated
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 */
matchRouter.post("/", requireGroupAdmin, createMatches);
/**
 * @openapi
 * /groups/{groupId}/matches/{matchId}:
 *   delete:
 *     tags: [Matches]
 *     summary: Delete group matches
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Matches deleted
 */
matchRouter.delete("/:matchId", requireGroupAdmin, deleteMatches);

/* ---------------- MESSAGE ROUTES ---------------- */
messageRouter.use("/", requireGroupMember);
/**
 * @openapi
 * /groups/{groupId}/chat/messages:
 *   get:
 *     tags: [Messages]
 *     summary: List group chat messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Messages found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMessage'
 */

messageRouter.get("/:messageId", getMessage);

messageRouter.get("/", getMessages);
/**
 * @openapi
 * /groups/{groupId}/chat/messages:
 *   post:
 *     tags: [Messages]
 *     summary: Create a group chat message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMessage'
 *     responses:
 *       201:
 *         description: Message created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatMessage'
 */
messageRouter.post("/", createMessage);
/**
 * @openapi
 * /groups/{groupId}/chat/messages/{messageId}:
 *   put:
 *     tags: [Messages]
 *     summary: Edit a group chat message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMessage'
 *     responses:
 *       200:
 *         description: Message edited
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatMessage'
 */
messageRouter.put(
  "/:messageId",
  requireResourceOwner(findMessageById, "messageId", "senderUserId"),
  editMessage,
);
/**
 * @openapi
 * /groups/{groupId}/chat/messages/{messageId}:
 *   delete:
 *     tags: [Messages]
 *     summary: Delete a group chat message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Message deleted
 */
messageRouter.delete(
  "/:messageId",
  requireResourceOwner(findMessageById, "messageId", "senderUserId"),
  deleteMessage,
);

/* ---------------- MOUNT CHILD ROUTERS ---------------- */
groupRouter.use("/:groupId/members", memberRouter);
groupRouter.use("/:groupId/families", familyRouter);
groupRouter.use("/:groupId/matches", matchRouter);
groupRouter.use("/:groupId/chat/messages", messageRouter);
