import "dotenv/config"; 
import { PrismaPg } from "@prisma/adapter-pg"; 
// @ts-ignore - Prisma is generated outside the API rootDir but emits runtime JS.
import { PrismaClient } from '../../../db/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const db = new PrismaClient({ adapter }); 
