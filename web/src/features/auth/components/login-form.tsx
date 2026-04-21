"use client"

import FormShell from "./form-shell"

export default function LoginForm() { // use zod validation
  function handleSubmit() {}
  return (
    <FormShell title="Login">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email Address</label>
          <input id="email" type="email"></input>
        </div>
        <div>
          <label>Password</label>
          <input id="password" type="password"></input>
        </div>
        <button>Log in</button> // add icon 
      </form>
    </FormShell>
  )
}