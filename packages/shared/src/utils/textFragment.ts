/**
 * W3C Scroll-to-Text Fragment Utility
 * Specification: https://wicg.github.io/scroll-to-text-fragment/
 * Syntax: #:~:text=[prefix-,]textStart[,textEnd][,-suffix]
 */

export interface TextFragmentOptions {
  prefix?: string;
  textStart: string;
  textEnd?: string;
  suffix?: string;
}

export function encodeFragmentComponent(str: string): string {
  // Characters "&", "-", "," have special syntactical meaning in fragments
  return encodeURIComponent(str.trim())
    .replace(/-/g, '%2D')
    .replace(/,/g, '%2C');
}

/**
 * Builds a valid W3C text fragment directive:
 * e.g. #:~:text=prefix-,start,end,-suffix
 */
export function buildTextFragmentDirective(options: TextFragmentOptions): string {
  const parts: string[] = [];

  if (options.prefix) {
    parts.push(`${encodeFragmentComponent(options.prefix)}-`);
  }

  parts.push(encodeFragmentComponent(options.textStart));

  if (options.textEnd) {
    parts.push(encodeFragmentComponent(options.textEnd));
  }

  if (options.suffix) {
    parts.push(`-${encodeFragmentComponent(options.suffix)}`);
  }

  return `#:~:text=${parts.join(',')}`;
}

/**
 * Generates an optimal deep-link Text Fragment URL from a target passage and optional full text.
 * For short phrases (<= 5 words), uses single exact match.
 * For longer passages, uses start and end boundaries to ensure robust cross-browser matching.
 */
export function createTextFragmentLink(
  baseUrl: string,
  passage: string,
  contextBefore?: string,
  contextAfter?: string
): string {
  const cleanPassage = passage.replace(/\s+/g, ' ').trim();
  const words = cleanPassage.split(' ');

  let textStart: string;
  let textEnd: string | undefined;

  if (words.length <= 6) {
    textStart = cleanPassage;
  } else {
    // Start with the first 4 words, end with the last 4 words
    textStart = words.slice(0, 4).join(' ');
    textEnd = words.slice(-4).join(' ');
  }

  let prefix: string | undefined;
  let suffix: string | undefined;

  if (contextBefore) {
    const beforeWords = contextBefore.trim().split(/\s+/);
    if (beforeWords.length > 0) {
      prefix = beforeWords.slice(-3).join(' ');
    }
  }

  if (contextAfter) {
    const afterWords = contextAfter.trim().split(/\s+/);
    if (afterWords.length > 0) {
      suffix = afterWords.slice(0, 3).join(' ');
    }
  }

  const directive = buildTextFragmentDirective({
    prefix,
    textStart,
    textEnd,
    suffix
  });

  // Strip any existing hash from baseUrl
  const cleanUrl = baseUrl.split('#')[0] ?? baseUrl;
  return `${cleanUrl}${directive}`;
}

/**
 * Decodes and parses a text fragment string if present in a URL.
 */
export function parseTextFragment(hash: string): TextFragmentOptions | null {
  const match = hash.match(/#:~:text=(.+)$/);
  if (!match || !match[1]) return null;

  const rawDirective = match[1];
  const parts = rawDirective.split(',');

  let prefix: string | undefined;
  let suffix: string | undefined;
  let textStart = '';
  let textEnd: string | undefined;

  let currentIndex = 0;

  // Check prefix (ends with -)
  if (parts[currentIndex]?.endsWith('-')) {
    prefix = decodeURIComponent(parts[currentIndex]!.slice(0, -1));
    currentIndex++;
  }

  // textStart
  if (parts[currentIndex]) {
    textStart = decodeURIComponent(parts[currentIndex]!);
    currentIndex++;
  }

  // Check if remaining has suffix (starts with -)
  if (currentIndex < parts.length) {
    const nextPart = parts[currentIndex]!;
    if (nextPart.startsWith('-')) {
      suffix = decodeURIComponent(nextPart.slice(1));
    } else {
      textEnd = decodeURIComponent(nextPart);
      currentIndex++;
      if (currentIndex < parts.length && parts[currentIndex]?.startsWith('-')) {
        suffix = decodeURIComponent(parts[currentIndex]!.slice(1));
      }
    }
  }

  return { prefix, textStart, textEnd, suffix };
}
