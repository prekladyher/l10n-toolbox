import { decodeEntries, encodeEntries, PoMessage } from "@prekladyher/l10n-toolbox-gettext";
import { createCommand } from 'commander';
import { readFile } from "fs/promises";
import { walkObject } from '../utils/walkObject.js';

export const program = createCommand('json')
  .description('Handling JSON files')

/**
 * Extract translation values from the object.
 */
 function extractStrings(object: Record<string, unknown>) {
  const entries: PoMessage[] = [{
    msgid: '',
    msgstr: [
      'Content-Transfer-Encoding: 8bit',
      'Content-Type: text/plain; charset=UTF-8',
      'Language: cs'
    ].join('\n')
  }];
  walkObject(object, '#', (string, pointer) => {
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

program.command('extract')
  .description('Extract translation values from the object')
  .argument('<asset-file>', 'asset file')
  .action(async assetFile => {
    const asset = JSON.parse(await readFile(assetFile, 'utf-8'));
    const source = JSON.parse(asset.m_Script);
    console.log(encodeEntries(extractStrings(source)));
  });

/**
 * Inject translation entries into the object.
 */
 function injectStrings(object: Record<string, unknown>, entries: PoMessage[]) {
  /** @type { Record<string, import("@prekladyher/l10n-gettext").PoMessage> } */
  const dictionary = Object.fromEntries(entries
    .filter(entry => entry.msgid !== '' && entry.msgctxt)
    .map(entry => [entry.msgctxt, entry]));
  walkObject(object, '#', (string, pointer) => {
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

program.command('inject')
  .description('Inject translation entries into the object')
  .argument('<asset-file>', 'asset file')
  .argument('<inject-file>', 'PO file with messages to inject')
  .action(async (assetFile, injectFile) => {
    const asset = JSON.parse(await readFile(assetFile, 'utf-8'));
    const source = JSON.parse(asset.m_Script);
    const entries = decodeEntries(await readFile(injectFile, 'utf-8'));
    asset.m_Script = JSON.stringify(injectStrings(source, entries));
    console.log(JSON.stringify(asset, null, '  '));
  });
