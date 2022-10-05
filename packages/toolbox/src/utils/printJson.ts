/**
 * Print JS object to standard output as formatted JSON string.
 * @param object Object to be printed.
 */
export function printJson(object: unknown) {
  console.log(JSON.stringify(object, null, '  '));
}
