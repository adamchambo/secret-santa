import { Router } from "express";
import { createGroup, deleteGroup, getGroup, getGroups, updateGroup } from "../controllers/group/group.controller.js";
import { createGroupMember, deleteGroupMember, getGroupMembers, updateGroupMember } from "../controllers/group/group-member.controller.js";
import { createFamily, deleteFamily, getFamilies, updateFamily } from "../controllers/group/family.controller.js";
import { createMatches, deleteMatches, getMatches } from "../controllers/group/match.controller.js";
import { createMessage, deleteMessage, editMessage, getMessages } from "../controllers/group/message.controller.js";

export const groupRouter = Router(); 

/* ---------------- GROUP ROUTES ---------------- */
groupRouter.get('/', getGroups); // use query param
groupRouter.get('/:groupId', getGroup); 
groupRouter.post('/', createGroup); 
groupRouter.put('/:groupId', updateGroup);
groupRouter.delete('/:groupId', deleteGroup)

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
familyRouter.post('/', createFamily);
familyRouter.put('/:familyId', updateFamily);
familyRouter.delete('/:familyId', deleteFamily);

/* ---------------- MATCH ROUTES ---------------- */
matchRouter.get('/', getMatches);
matchRouter.post('/', createMatches); 
matchRouter.delete('/:matchId', deleteMatches); 

/* ---------------- MESSAGE ROUTES ---------------- */
messageRouter.get('/', getMessages);
messageRouter.post('/', createMessage); 
messageRouter.put('/:messageId', editMessage);
messageRouter.delete('/:messageId', deleteMessage);

/* ---------------- MOUNT CHILD ROUTERS ---------------- */
groupRouter.use('/:groupId/members', memberRouter); 
groupRouter.use('/:groupId/families', familyRouter);
groupRouter.use('/:groupId/matches', matchRouter);
groupRouter.use('/:groupId/chat/messages', messageRouter); 




