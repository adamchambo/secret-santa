"use client"

import FormShell from "./form-shell"

export default function RegisterForm() { // use zod validation
  function handleSubmit() {

  }
  return (
    <FormShell title="Sign Up">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email Address</label>
          <input id="email" type="email"></input>
        </div>
        <div>
          <label>Password</label>
          <input id="password" type="password"></input>
        </div>
        <button>Create Account</button> // add arrow 
      </form>
    </FormShell>
  )
}
