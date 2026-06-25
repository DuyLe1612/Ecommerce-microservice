import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateProductSlug(name?: string | null, id?: number | string | null): string {
  if (!name && !id) return "";
  if (!name) return String(id);
  const slugifiedName = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return id ? `${slugifiedName}-${id}` : slugifiedName;
}
