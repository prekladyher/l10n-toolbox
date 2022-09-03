import { decodeEntries, encodeEntries } from "@prekladyher/l10n-gettext";
import { readFile } from "fs/promises";

if (process.argv.length < 3) {
  console.error(`Usage: json <asset-file> [merge-file]`);
  process.exit(1);
}

/**
 * Escape JSON pointer reference.
 * https://www.rfc-editor.org/rfc/rfc6901#section-3
 */
function escapeRef(ref) {
  const escaped = JSON.stringify(ref.replaceAll(/[~/]/g, value => value === '~' ? '~0' : '~1'));
  return escaped.substring(1, escaped.length - 1);
}

/**
 * Walk through the object tree and process string values.
 * @param {*} object Object being processed.
 * @param {string} pointer JSON pointer for the currently processed object.
 * @param {(path: string, string: string) => string|void} callback Callback to process string.
 * @return {string|undefined} Processed string if it has to be replaced.
 */
function walk(object, pointer, callback) {
  if (Array.isArray(object)) {
    for (let i = 0; i < object.length; i++) {
      const replace = walk(object[i], `${pointer}/${i}`, callback);
      if (typeof replace === 'string') {
        object[i] = replace;
      }
    }
  } else if (typeof object === "object" && object) {
    for (const [ key, value ] of Object.entries(object)) {
      const replace = walk(value, `${pointer}/${escapeRef(key)}`, callback);
      if (typeof replace === 'string') {
        object[key] = replace;
      }
    }
  } else if (typeof object === 'string') {
    return callback(object, pointer) ?? undefined;
  }
}

/**
 * Extract translation values from the object.
 */
function extract(object) {
  /** @type { import("@prekladyher/l10n-gettext").PoMessage[] } */
  const entries = [{
    msgid: '',
    msgstr: [
      'Content-Transfer-Encoding: 8bit',
      'Content-Type: text/plain; charset=UTF-8',
      'Language: cs'
    ].join('\n')
  }];
  walk(object, '#', (string, pointer) => {
    if (string.startsWith('^') && string !== '^' && string !== '^ ') {
      entries.push({
        msgctxt: pointer,
        msgid: string,
        msgstr: ''
      });
    }
  });
  return entries;
}

/**
 * Inject translation entries into the object.
 */
function inject(object, entries) {
  /** @type { Record<string, import("@prekladyher/l10n-gettext").PoMessage> } */
  const dictionary = Object.fromEntries(entries
    .filter(entry => entry.msgid !== '' && entry.msgctxt)
    .map(entry => [entry.msgctxt, entry]));
  walk(source, '#', (string, pointer) => {
    const entry = dictionary[pointer];
    if (!entry || !entry.msgstr) {
      return;
    }
    if (entry.msgid !== string) {
      console.error(`Source string mismatch at ${pointer}`);
      return;
    }
    return entry.msgstr;
  });
  return object;
}

const asset = JSON.parse(await readFile(process.argv[2], 'utf-8'));
const source = JSON.parse(asset.m_Script);

if (process.argv.length < 4) {
  console.log(encodeEntries(extract(source)));
} else {
  const entries = decodeEntries(await readFile(process.argv[3], 'utf-8'));
  asset.m_Script = JSON.stringify(inject(source, entries));
  console.log(JSON.stringify(asset, null, '  '));
}
