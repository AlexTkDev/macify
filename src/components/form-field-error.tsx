export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <span className="field-error">{errors[0]}</span>;
}
