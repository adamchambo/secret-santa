import { Router } from "express";
import { userRouter } from "./user.route.js";
import { groupRouter } from "./group.route.js";

const appRouter = Router(); 

/* ---------------- APP ROUTES ---------------- */
appRouter.use("/users", userRouter);
appRouter.use("/groups", groupRouter); 

export default appRouter; 

