import { Router } from "express";
import { userRouter } from "./user.route.js";
import { groupRouter } from "./group.route.js";

const appRouter: Router = Router(); 

/* ---------------- APP ROUTES ---------------- */
appRouter.use("/users", userRouter);
appRouter.get("/groups/:groupId/chat/ws", (_req, res) => {
  res
    .status(426)
    .set("Connection", "Upgrade")
    .json({ error: "WebSocket upgrade required" });
});
appRouter.use("/groups", groupRouter); 

export default appRouter; 
