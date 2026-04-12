import { createClient } from "@supabase/supabase-js";
import "dotenv"; 

const URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; 

export const supabase = createClient(URL, SERVICE_KEY)