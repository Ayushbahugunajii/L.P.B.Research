import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PaperResultItem } from '@study-search/shared';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(totalSeconds: number): string {
  const rounded = Math.floor(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString();
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function generateBibtex(paper: PaperResultItem): string {
  const firstAuthorLast = paper.authors[0]?.name.split(' ').pop()?.toLowerCase() || 'unknown';
  const citeKey = `${firstAuthorLast}${paper.year}`;
  const authorList = paper.authors.map((a) => a.name).join(' and ');

  return `@article{${citeKey},
  title = {${paper.title}},
  author = {${authorList}},
  year = {${paper.year}}${paper.venue ? `,\n  journal = {${paper.venue}}` : ''}${paper.doi ? `,\n  doi = {${paper.doi}}` : ''}${paper.pdfUrl ? `,\n  url = {${paper.pdfUrl}}` : ''}
}`;
}
