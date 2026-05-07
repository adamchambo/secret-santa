import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

export const authSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type AuthFormValues = z.infer<typeof authSchema>;

export function useAuthForm() {
  return useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
  });
}