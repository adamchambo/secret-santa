import 'dotenv/config'; 
import express, { json, urlencoded } from "express";
import cors from "cors"; 
import { secure } from "./middleware/secure.middleware.js";
import { logger } from "./middleware/logger.middleare.js";
import { notfoundHandler } from "./middleware/not-found.middleare.js";
import { errorHandler } from "./middleware/error.middleware.js";
import appRouter from "./routes/app.route.js";
import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerUi } from './utils/swagger-ui.js';

const app = express(); 

/* ---------------- MIDDLEWARE ---------------- */
app.use(secure); 
app.use(logger); 
app.use(cors()); 
app.use(json());
app.use(urlencoded({ extended: true }));

const URL = process.env.API_BASE_URL || "http://localhost";
const PORT = process.env.PORT || 5000; 

const specs = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: "Secret Santa API",
      version: "1.0.0",
      description: "API documentation for the Secret Santa application"
    },
  servers: [{ url: `${URL}:${PORT}/api`}],
},
apis: ["./src/routes/*.ts"],
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.get("/api/openapi.json", (_, res) => res.json(specs));

app.use('/api', appRouter); 
app.use(notfoundHandler);
app.use(errorHandler);


/* ---------------- SERVER ---------------- */
app.listen(PORT, () => {
  console.log(`Server listening on port: ${URL}:${PORT}`);
});
