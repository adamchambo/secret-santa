import { Request, Response, NextFunction } from "express";
import { jwtVerify, createRemoteJWKSet, JWTPayload } from "jose";
import "dotenv"; 
import { findGroupMemberByUserId } from "@/services/group/group-member.service.js";

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string };
    }
  }
}

const JWKSEndpoint = process.env.JWKS_ENDPOINT!;
const JWKS = createRemoteJWKSet(new URL(JWKSEndpoint));

/* ---------------- AUTH BOUNDARY ---------------- */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization; 
  if (!header) return res.status(401).json({error: "Missing authorisation header"});
  const token = header.split(" ")[1]; 
  if (!token) return res.status(401).json({error: "Missing authorisation token"});
  try {
    const { payload } = await jwtVerify(token, JWKS);
    if (!payload.sub) return res.status(401).json({ error: "Invalid token" }); 
    req.user = { sub: payload.sub };
    next(); 
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/* ---------------- OWNER BOUNDARY ---------------- */
export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.sub) return res.status(403).json({error: "Unauthorised access"}); // not needed
  const uid = req.user.sub; 
  if (uid !== req.params.userId) return res.status(403).json({ error: "Forbidden" });
  next();
}

export function requireResourceOwner(getResource: (id: string) => Promise<{ userId: string } | null>, idParam: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[idParam];
    if (!id || typeof id !== "string") return res.status(400).json({ error: "Invalid resource id"});
    const resource = await getResource(id);
    if (!resource) return res.status(404).json({ error: "Not found" });
    if (resource.userId !== req.user?.sub) return res.status(403).json({ error: "Forbidden" });
    next();
  }
}

/* ---------------- GROUP-MEMBER BOUNDARY ---------------- */
export async function requireGroupMember(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub; 
    const groupId = req.params.groupId; 
    if (!userId || !groupId || typeof groupId !== "string") return res.status(403).json({ error: "Forbidden" });
    const member = await findGroupMemberByUserId(userId, groupId); 
    if (!member) return res.status(403).json({ error: "Not a group member"} );
    next(); 
  } catch (err) {
    next(err); 
  }
}

/* ---------------- ADMIN BOUNDARY ---------------- */
export function requireGroupAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.sub) return res.status(403).json({error: "Unauthorised access"}); // not needed
  const uid = req.user.sub;
  if (uid !== req.params.adminId) return res.status(403).json({ error: "Forbidden" });
  next();
}

