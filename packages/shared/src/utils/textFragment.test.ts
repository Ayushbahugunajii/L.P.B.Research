import { describe, it, expect } from 'vitest';
import {
  createTextFragmentLink,
  buildTextFragmentDirective,
  parseTextFragment,
  encodeFragmentComponent
} from './textFragment.js';

describe('textFragment utilities', () => {
  it('encodes special characters correctly per W3C specification', () => {
    expect(encodeFragmentComponent('hello world')).toBe('hello%20world');
    expect(encodeFragmentComponent('hyphen-word')).toBe('hyphen%2Dword');
    expect(encodeFragmentComponent('comma,test')).toBe('comma%2Ctest');
  });

  it('builds a direct match directive for short text', () => {
    const directive = buildTextFragmentDirective({
      textStart: 'attention mechanism'
    });
    expect(directive).toBe('#:~:text=attention%20mechanism');
  });

  it('builds a range directive with start and end for passages', () => {
    const directive = buildTextFragmentDirective({
      textStart: 'In this paper',
      textEnd: 'novel architecture'
    });
    expect(directive).toBe('#:~:text=In%20this%20paper,novel%20architecture');
  });

  it('builds a context-aware directive with prefix and suffix', () => {
    const directive = buildTextFragmentDirective({
      prefix: 'as shown in',
      textStart: 'Figure 1',
      textEnd: 'transformer model',
      suffix: 'which achieves'
    });
    expect(directive).toBe('#:~:text=as%20shown%20in-,Figure%201,transformer%20model,-which%20achieves');
  });

  it('creates full URL with text fragment stripping existing hashes', () => {
    const url = 'https://example.com/article#existing-hash';
    const passage = 'Transformers are a type of neural network architecture developed by Google.';
    const link = createTextFragmentLink(url, passage);

    expect(link).toContain('https://example.com/article#:~:text=');
    expect(link).not.toContain('#existing-hash');
  });

  it('parses text fragments back into structured components', () => {
    const parsed = parseTextFragment('https://example.com#:~:text=prefix-,start,end,-suffix');
    expect(parsed).not.toBeNull();
    expect(parsed?.prefix).toBe('prefix');
    expect(parsed?.textStart).toBe('start');
    expect(parsed?.textEnd).toBe('end');
    expect(parsed?.suffix).toBe('suffix');
  });
});
