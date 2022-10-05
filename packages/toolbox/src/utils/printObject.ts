const INSPECT_OPTS = {
  depth: null,
  maxArrayLength: Infinity,
  maxStringLength: Infinity,
  breakLength: Infinity,
  showHidden: false,
  compact: false
};

/**
 * Print object to standard output.
 * @param object Object to be printed.
 * @param depth Inspection depth.
 */
export function printObject(object: unknown, depth = Infinity) {
  console.dir(object, { ...INSPECT_OPTS, depth });
}
