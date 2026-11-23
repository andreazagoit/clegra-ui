import { Input, type InputProps } from "./input.native"

export function Textarea({ rows = 3, className = "", ...props }: InputProps) {
  return <Input {...props} rows={rows} className={`h-auto min-h-16 rounded-2xl py-3 ${className}`} />
}
