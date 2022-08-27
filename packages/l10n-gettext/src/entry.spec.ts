import { readFile } from 'node:fs/promises';
import { decodeEntry, encodeEntries, encodeEntry } from './entry.js';

describe('PO file library', async () => {

  const TEST_ENTRY = {
    '#': 'This is\na multiline comment',
    '#,': 'fuzzy',
    'msgctxt': 'simple attribute',
    'msgid': 'multiline\nattribute',
    'msgstr': '"quoted attribute"'
  };

  const TEST_FILE = (await readFile(new URL('../test/sample.po', import.meta.url), 'utf-8')).trim();

  it('encodes sample entry', function() {
    expect(encodeEntry(TEST_ENTRY)).toBe(TEST_FILE);
  });

  it('decodes sample entry', function() {
    expect(decodeEntry(TEST_FILE)).toEqual(TEST_ENTRY);
  });

  it('encodes as Lokalize', function() {
    expect(encodeEntries([{ msgid: '', msgstr: 'foo\n' }]))
      .toBe(`msgid ""\nmsgstr ""\n"foo\\n"`);
    expect(encodeEntries([{ msgid: '', msgstr: 'foo\nbar\n' }]))
      .toBe(`msgid ""\nmsgstr ""\n"foo\\n"\n"bar\\n"`);
  });
});
