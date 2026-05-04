"use client";

import { useState } from "react";
import FormShell from "./form-shell";

export default function LoginForm() {
  // use zod validation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
  }
  return (
    <FormShell title="Login">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email Address</label>
          <input
            className="h-10 bg-background 
          text-text-muted rounded-sm py-2 pl-2"
            id="email"
            type="email"
            placeholder="bob-ross@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          ></input>
        </div>
        <div className="flex flex-col gap-2">
          <label>Password</label>
          <input
            className="h-10 bg-background text-text-muted rounded-sm py-2 pl-2"
            id="password"
            type="password"
            placeholder="randompassword123"
            value={password}
            onChange={e => setPassword(e.target.value)}
          ></input>
        </div>
        <button className="h-10 self-center mt-4 p-1 bg-primary rounded-md items-center hover:cursor-pointer text-white w-full">
          Submit
        </button>
        {/* add icon to submit */}
      </form>
    </FormShell>
  );
}