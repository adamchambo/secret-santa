import {
  acceptJoinRequestById,
  createJoinRequestByInviteCode,
  deleteJoinRequestById,
  findJoinRequestsByGroupId,
} from "@/services/group/join-request.service.js";
import { NextFunction, Request, Response } from "express";

export async function createJoinRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const inviteCode = String(req.body.inviteCode ?? "").trim();
    if (!inviteCode) return res.status(400).json({ error: "Invite code is required" });

    const result = await createJoinRequestByInviteCode(userId, inviteCode);
    if (!result) return res.status(404).json({ error: "No group found for that invite code" });

    return res.status(result.status === "already-member" ? 200 : 201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getJoinRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const groupId = req.params.groupId;
    if (!groupId || typeof groupId !== "string") {
      return res.status(404).json({ error: "Request doesn't have a valid group id" });
    }

    const requests = await findJoinRequestsByGroupId(groupId);
    return res.json(requests);
  } catch (err) {
    next(err);
  }
}

export async function acceptJoinRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const groupId = req.params.groupId;
    const requestId = req.params.requestId;
    if (!groupId || typeof groupId !== "string") {
      return res.status(404).json({ error: "Request doesn't have a valid group id" });
    }
    if (!requestId || typeof requestId !== "string") {
      return res.status(404).json({ error: "Request doesn't have a valid request id" });
    }

    const member = await acceptJoinRequestById(groupId, requestId);
    return res.status(201).json(member);
  } catch (err) {
    next(err);
  }
}

export async function declineJoinRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const groupId = req.params.groupId;
    const requestId = req.params.requestId;
    if (!groupId || typeof groupId !== "string") {
      return res.status(404).json({ error: "Request doesn't have a valid group id" });
    }
    if (!requestId || typeof requestId !== "string") {
      return res.status(404).json({ error: "Request doesn't have a valid request id" });
    }

    await deleteJoinRequestById(groupId, requestId);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
