import { CommentKey, MessageAttrs, PoMessage } from './types.js';

/**
 * PO comment field orer.
 */
const COMMENT_ORDER: CommentKey[] = ['#', '#.', '#:', '#,', '#|'];

/**
 * PO attribute order (without plural forms).
 */
const ATTRIBUTE_ORDER: (keyof MessageAttrs)[] = ['msgctxt', 'msgid', 'msgstr'];

/**
  * Encode PO file entries.
  */
export function encodeEntries(entries: PoMessage[]) {
  return entries.map(entry => encodeEntry(entry)).join('\n\n');
}

/**
 * Encode single PO file entry.
 */
export function encodeEntry(entry: PoMessage) {
  const result: string[] = [];
  for (const type of COMMENT_ORDER) {
    entry[type]?.split('\n').forEach(line => result.push(`${type} ${line}`));
  }
  for (const type of ATTRIBUTE_ORDER) {
    const value = entry[type];
    if (value !== undefined) {
      result.push(encodeAttribute(type, value));
    }
  }
  return result.join('\n');
}

/**
 * Encode single PO entry attribute.
 */
export function encodeAttribute(name: string, value: string) {
  if (value === '') {
    return `${name} ""`; // Empty attribute corner case
  }
  const encoded = encodeValue(value);
  if (name === 'msgstr' || encoded.length > 1) {
    return `${name} ""\n"${encoded.join('"\n"')}"`;
  }
  return `${name} "${encoded[0]}"`;
}

/**
 * Encode PO entry string attribute value into separate lines.
 */
// XXX This is the function to have word-wrapping logic if necessary
function encodeValue(value: string) {
  // Using JSON stringify to for lazy and easy escaping
  return value.split(/(?<=\n)/).map(line => JSON.stringify(line).slice(1, -1));
}

/**
 * Decode PO file content.
 */
export function decodeEntries(content: string) {
  const entries = content.trim().split(/\r?\n\r?\n+/m);
  return entries.map(entry => decodeEntry(entry));
}

/**
 * Decode single encoded PO file entry.
 */
export function decodeEntry(encoded: string): PoMessage {
  const fields: [keyof PoMessage, string][] = [];
  for (const line of encoded.split(/\r?\n/)) {
    if (fields.length && line[0] === "\"") {
      fields[fields.length - 1][1] += decodeValue(line);  // Attribute value line continuation
      continue;
    }
    const split = line.indexOf(" ");
    const type = split >= 0 ? line.substring(0, split) : line;
    const value = split >= 0 ? line.substring(split + 1) : '';
    if (type.startsWith('#')) {
      if (fields.length && fields[fields.length - 1][0] === type) {
        fields[fields.length - 1][1] += '\n' + value; // Comment field continuation
      } else {
        fields.push([type as CommentKey, value]);
      }
    } else {
      fields.push([type as keyof MessageAttrs, decodeValue(value)]);
    }

  }
  return Object.fromEntries(fields) as unknown as PoMessage;
}

/**
 * Decode PO entry string attribute value.
 */
function decodeValue(value: string) {
  // Using JSON parse for lazy and easy parsing.
  return JSON.parse(value);
}
