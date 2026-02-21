// src/i18n/pseudo-locale.ts

/**
 * Pseudo-localization transforms English text to look "foreign"
 * while remaining readable. This helps developers spot:
 *
 * 1. Hardcoded strings (they won't be pseudo-localized)
 * 2. Layout issues from longer text (pseudo text is ~30% longer)
 * 3. Character encoding issues (uses accented characters)
 * 4. Truncated text (longer strings reveal overflow)
 *
 * Example: "Hello World" -> "[H\u00e9ll\u00f6 W\u00f6rld~~~]"
 *
 * Enable by setting locale to 'pseudo' in development.
 */

const CHAR_MAP: Record<string, string> = {
  a: '\u00e4', b: '\u0180', c: '\u00e7', d: '\u00f0', e: '\u00e9', f: '\u0192',
  g: '\u011d', h: '\u0125', i: '\u00ee', j: '\u0135', k: '\u0137', l: '\u013a',
  m: '\u0271', n: '\u00f1', o: '\u00f6', p: '\u00fe', q: '\u01eb', r: '\u0155',
  s: '\u0161', t: '\u0163', u: '\u00fc', v: '\u1e7f', w: '\u0175', x: '\u1e8b',
  y: '\u00fd', z: '\u017e',
  A: '\u00c1', B: '\u0181', C: '\u00c7', D: '\u00d0', E: '\u00c9', F: '\u01a6',
  G: '\u011c', H: '\u0124', I: '\u00ce', J: '\u0134', K: '\u0136', L: '\u0139',
  M: '\u1e40', N: '\u00d1', O: '\u00d6', P: '\u00de', Q: '\u01ea', R: '\u0154',
  S: '\u0160', T: '\u0162', U: '\u00dc', V: '\u1e7e', W: '\u0174', X: '\u1e8a',
  Y: '\u00dd', Z: '\u017d',
};

/**
 * Pseudo-localize a message string.
 * Preserves ICU message syntax ({variable}, {count, plural, ...}).
 */
export function pseudoLocalize(message: string): string {
  let result = '';
  let inBrace = 0;
  let inTag = false;

  for (const char of message) {
    if (char === '{') {
      inBrace++;
      result += char;
    } else if (char === '}') {
      inBrace--;
      result += char;
    } else if (char === '<') {
      inTag = true;
      result += char;
    } else if (char === '>') {
      inTag = false;
      result += char;
    } else if (inBrace > 0 || inTag) {
      // Don't transform ICU syntax or HTML tags
      result += char;
    } else {
      result += CHAR_MAP[char] ?? char;
    }
  }

  // Add padding (~30% longer) to simulate translation expansion
  const paddingLength = Math.ceil(message.length * 0.3);
  const padding = '~'.repeat(paddingLength);

  return `[${result}${padding}]`;
}

/**
 * Creates a pseudo-localized message bundle from an English source.
 */
export function createPseudoMessages(
  source: Record<string, string>,
): Record<string, string> {
  const pseudo: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    pseudo[key] = pseudoLocalize(value);
  }
  return pseudo;
}
