import 'dotenv/config'; 
import express, { json, urlencoded } from "express";
import cors from "cors"; 
import { secure } from "./middleware/secure.middleware.js";
import { logger } from "./middleware/logger.middleare.js";
import { notfoundHandler } from "./middleware/not-found.middleare.js";
import { errorHandler } from "./middleware/error.middleware.js";
import appRouter from "./routes/app.route.js";

const app = express(); 

/* ---------------- MIDDLEWARE ---------------- */
app.use(secure); 
app.use(logger); 
app.use(cors()); 
app.use(json());
app.use(urlencoded({ extended: true }));

app.use('/api', appRouter); 
app.use(notfoundHandler);
app.use(errorHandler);

/* ---------------- SERVER ---------------- */
const URL = process.env.API_BASE_URL || "http://localhost";
const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
  console.log(`Server listening on port: ${URL}:${PORT}`);
});