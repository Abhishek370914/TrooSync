import { cn } from "./utils";

export function clsx(...inputs: (string | undefined | null | false)[]) {
  return cn(...inputs);
}
