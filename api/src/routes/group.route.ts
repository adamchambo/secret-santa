import { Router } from "express";
import { createGroup, deleteGroupById, getGroupById, getGroupsByUserId, updateGroupById } from "../controllers/group/group.controller.js";
import { createGroupMemberByGroupId, deleteGroupMemberById, getGroupMembersByGroupId } from "../controllers/group/group-member.controller.js";
import { deleteFamilyById, getFamiliesByGroupId, upsertFamilyById } from "../controllers/group/families.controller.js";
import { createMatchesByGroupId, deleteMatchesById, getMatchesByGroupId } from "../controllers/group/matches.controller.js";
import { getChatByGroupId } from "../controllers/group/chat.controller.js";
import { createMessageByChatId, deleteMessageById, editMessageById, getMessagesByChatId } from "../controllers/group/messages.controller.js";

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
const chatRouter = Router({ mergeParams: true });
const messageRouter = Router({ mergeParams: true }); 

/* ---------------- GROUP MEMBER ROUTES ---------------- */
memberRouter.get('/', getGroupMembersByGroupId);
memberRouter.post('/', createGroupMemberByGroupId);
memberRouter.delete('/:memberId', deleteGroupMemberById); 

/* ---------------- FAMILY ROUTES ---------------- */
familyRouter.get('/', getFamiliesByGroupId);
familyRouter.put('/:familyId', upsertFamilyById);
familyRouter.delete('/:familyId', deleteFamilyById);

/* ---------------- MATCH ROUTES ---------------- */
matchRouter.get('/', getMatchesByGroupId);
matchRouter.post('/', createMatchesByGroupId); 
matchRouter.delete('/:matchId', deleteMatchesById); 

/* ---------------- CHAT ROUTES ---------------- */
chatRouter.get('/', getChatByGroupId);

/* ---------------- MESSAGE ROUTES ---------------- */
messageRouter.get('/', getMessagesByChatId);
messageRouter.post('/', createMessageByChatId); 
messageRouter.put('/:messageId', editMessageById);
messageRouter.delete('/:messageId', deleteMessageById);

/* ---------------- MOUNT CHILD ROUTERS ---------------- */
groupRouter.use('/:groupId/members', memberRouter); 
groupRouter.use('/:groupId/families', familyRouter);
groupRouter.use('/:groupId/matches', matchRouter);
groupRouter.use('/:groupId/chat', chatRouter); 
chatRouter.use('/:chatId/messages', messageRouter); 




