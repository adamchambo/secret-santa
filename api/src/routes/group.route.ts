import { Router } from "express";
import { createGroup, deleteGroupById, getGroupById, getGroupsByUserId, updateGroupById } from "../controllers/group/group.controller.js";
import { createGroupMemberByGroupId, deleteGroupMemberById, getGroupMembersByGroupId, updateGroupMemberByGroupId } from "../controllers/group/group-member.controller.js";
import { createFamilyByGroupId, deleteFamilyById, getFamiliesByGroupId, updateFamilyById} from "../controllers/group/family.controller.js";
import { createMatchesByGroupId, deleteMatchesById, getMatchesByGroupId } from "../controllers/group/match.controller.js";
import { createMessageByGroupId, deleteMessageById, editMessageById, getMessagesByGroupId } from "../controllers/group/message.controller.js";

export const groupRouter = Router(); 

/* ---------------- GROUP ROUTES ---------------- */
groupRouter.get('/', getGroupsByUserId); // use query param
groupRouter.get('/:groupId', getGroupById); 
groupRouter.post('/', createGroup); 
groupRouter.put('/:groupId', updateGroupById);
groupRouter.delete('/:groupId', deleteGroupById)

/* ---------------- CHILD ROUTERS ---------------- */
const memberRouter = Router({ mergeParams: true });
const familyRouter = Router({ mergeParams: true });
const matchRouter = Router({ mergeParams: true });
const messageRouter = Router({ mergeParams: true }); 

/* ---------------- GROUP MEMBER ROUTES ---------------- */
memberRouter.get('/', getGroupMembersByGroupId);
memberRouter.post('/', createGroupMemberByGroupId);
memberRouter.put('/:memberId', updateGroupMemberByGroupId);  
memberRouter.delete('/:memberId', deleteGroupMemberById); 

/* ---------------- FAMILY ROUTES ---------------- */
familyRouter.get('/', getFamiliesByGroupId);
familyRouter.post('/', createFamilyByGroupId);
familyRouter.put('/:familyId', updateFamilyById);
familyRouter.delete('/:familyId', deleteFamilyById);

/* ---------------- MATCH ROUTES ---------------- */
matchRouter.get('/', getMatchesByGroupId);
matchRouter.post('/', createMatchesByGroupId); 
matchRouter.delete('/:matchId', deleteMatchesById); 

/* ---------------- MESSAGE ROUTES ---------------- */
messageRouter.get('/', getMessagesByGroupId);
messageRouter.post('/', createMessageByGroupId); 
messageRouter.put('/:messageId', editMessageById);
messageRouter.delete('/:messageId', deleteMessageById);

/* ---------------- MOUNT CHILD ROUTERS ---------------- */
groupRouter.use('/:groupId/members', memberRouter); 
groupRouter.use('/:groupId/families', familyRouter);
groupRouter.use('/:groupId/matches', matchRouter);
groupRouter.use('/:groupId/chat/messages', messageRouter); 




