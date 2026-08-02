import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;

export function sanitizeDisplayName(name) {
  if (!name || typeof name !== 'string') return '';
  let cleaned = name.trim();

  // Clean up corrupted name strings (e.g. IMG DIMG DJohnoctoroctor -> Dr. John Doctor)
  cleaned = cleaned.replace(/DIMG\s*DJohnoctoroctor/gi, 'Dr. John Doctor');
  cleaned = cleaned.replace(/DJohnoctoroctor/gi, 'Dr. John Doctor');

  // Remove duplicate/glitched prefixes (e.g. IMG Dr. John -> Dr. John)
  cleaned = cleaned.replace(/^(?:IMG\s*|DIMG\s*|Dr\.\s*|Doctor\s*)+/gi, (match) => {
    if (/dr|doctor/i.test(match)) return 'Dr. ';
    return '';
  });
  const words = cleaned.split(/\s+/);
  const uniqueWords = [];
  for (let i = 0; i < words.length; i++) {
    if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
      uniqueWords.push(words[i]);
    }
  }
  return uniqueWords.join(' ').trim();
}

