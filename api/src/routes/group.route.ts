import { Router } from "express";
import { createGroup, deleteGroup, getGroup, getGroups, updateGroup } from "../controllers/group/group.controller.js";
import { createGroupMember, deleteGroupMember, getGroupMembers, updateGroupMember } from "../controllers/group/group-member.controller.js";
import { createFamily, deleteFamily, getFamilies, updateFamily } from "../controllers/group/family.controller.js";
import { createMatches, deleteMatches, getMatches } from "../controllers/group/match.controller.js";
import { createMessage, deleteMessage, editMessage, getMessages } from "../controllers/group/message.controller.js";
import { requireAuth, requireGroupAdmin, requireGroupMember, requireResourceOwner } from "@/middleware/auth.middleware.js";
import { findMessageById } from "@/services/group/message.service.js";

export const groupRouter = Router(); 
groupRouter.use(requireAuth); 

/* ---------------- GROUP ROUTES ---------------- */
groupRouter.get('/', getGroups); // use query param
groupRouter.get('/:groupId', getGroup); 
groupRouter.post('/', createGroup); 
groupRouter.put('/:groupId', requireGroupAdmin, updateGroup);
groupRouter.delete('/:groupId', requireGroupAdmin, deleteGroup)

/* ---------------- CHILD ROUTERS ---------------- */
const memberRouter = Router({ mergeParams: true });
const familyRouter = Router({ mergeParams: true });
const matchRouter = Router({ mergeParams: true });
const messageRouter = Router({ mergeParams: true }); 

/* ---------------- GROUP MEMBER ROUTES ---------------- */
memberRouter.get('/', getGroupMembers);
memberRouter.post('/', createGroupMember);
memberRouter.put('/:memberId', updateGroupMember);  
memberRouter.delete('/:memberId', deleteGroupMember); 

/* ---------------- FAMILY ROUTES ---------------- */
familyRouter.get('/', getFamilies);
familyRouter.post('/', requireGroupAdmin, createFamily);
familyRouter.put('/:familyId', requireGroupAdmin, updateFamily);
familyRouter.delete('/:familyId', requireGroupAdmin, deleteFamily);

/* ---------------- MATCH ROUTES ---------------- */
matchRouter.get('/', getMatches);
matchRouter.post('/', requireGroupAdmin, createMatches); 
matchRouter.delete('/:matchId', requireGroupAdmin, deleteMatches); 

/* ---------------- MESSAGE ROUTES ---------------- */
messageRouter.use('/', requireGroupMember);
messageRouter.get('/', getMessages);
messageRouter.post('/', createMessage); 
messageRouter.put('/:messageId', requireResourceOwner(findMessageById, "messageId"), editMessage);
messageRouter.delete('/:messageId', requireResourceOwner(findMessageById, "messageId"), deleteMessage);

/* ---------------- MOUNT CHILD ROUTERS ---------------- */
groupRouter.use('/:groupId/members', memberRouter); 
groupRouter.use('/:groupId/families', familyRouter);
groupRouter.use('/:groupId/matches', matchRouter);
groupRouter.use('/:groupId/chat/messages', messageRouter); 




