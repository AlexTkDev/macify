"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

export function PendingSubmitButton({ children, disabled, ...props }: ComponentProps<"button">) {
  const { pending, data } = useFormStatus();
  const active = !props.name || data?.get(props.name) === props.value;
  const variant = props.className?.includes("button-danger") ? "danger-soft" : props.className?.includes("button-secondary") ? "secondary" : "primary";
  return <button {...props} data-ui-button="" data-variant={variant} data-size="md" data-pending={pending && active ? "true" : undefined} aria-busy={pending && active} disabled={disabled || pending} aria-disabled={disabled || pending}>
    {pending && active ? "Processing…" : children}
  </button>;
}
