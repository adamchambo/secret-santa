import { createClient } from "@/src/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useEmailVerfication() {
  const navigate = useRouter();
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event == "SIGNED_IN" && session?.user?.email_confirmed_at) {
        navigate.push("/dashboard");
      }
    });
    return () => {
        subscription.unsubscribe();
    }
  }, [navigate]);
}
