"use client";

import { useActionState } from "react";
import { loginAdmin, type LoginState } from "@/app/editor-login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initialState);
  return (
    <form action={action} className="editor-login-form">
      {state.error && <p className="editor-login-error" role="alert">{state.error}</p>}
      <label><span>Email address</span><input autoComplete="username" inputMode="email" name="email" required type="email" /></label>
      <label><span>Password</span><input autoComplete="current-password" name="password" required type="password" /></label>
      <button data-ui-button="" data-variant="primary" data-size="lg" data-pending={pending ? "true" : undefined} aria-busy={pending} disabled={pending} type="submit">{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
