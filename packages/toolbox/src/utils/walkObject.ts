/**
 * Escape JSON pointer reference.
 * https://www.rfc-editor.org/rfc/rfc6901#section-3
 */
export function escapeRef(ref: string): string {
  const escaped = JSON.stringify(ref.replaceAll(/[~/]/g, value => value === '~' ? '~0' : '~1'));
  return escaped.substring(1, escaped.length - 1);
}

/**
 * Walk callback for registering or replacing object values.
 */
export type WalkCallback = (path: string, string: string) => string|void;

/**
 * Walk through the object tree and process string values.
 * @param object Object being processed.
 * @param pointer JSON pointer for the currently processed object.
 * @param callback Callback to process string.
 * @return Processed string if it has to be replaced.
 */
export function walkObject(object: unknown, pointer: string, callback: WalkCallback) {
  if (Array.isArray(object)) {
    for (let i = 0; i < object.length; i++) {
      const replace = walkObject(object[i], `${pointer}/${i}`, callback);
      if (typeof replace === 'string') {
        object[i] = replace;
      }
    }
  } else if (typeof object === "object" && object) {
    for (const [ key, value ] of Object.entries(object)) {
      const replace = walkObject(value, `${pointer}/${escapeRef(key)}`, callback);
      if (typeof replace === 'string') {
        (object as Record<string, unknown>)[key] = replace;
      }
    }
  } else if (typeof object === 'string') {
    return callback(object, pointer) ?? undefined;
  }
}
