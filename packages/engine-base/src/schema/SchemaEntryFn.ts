import { SchemaEntry } from './SchemaEntry';

export type SchemaFlags = Record<string, boolean>;

/**
 * Factory method creating alternative type schema based on the provided flags.
 */
export interface SchemaEntryFn {

  /**
   * Create schema based on the provided flags.
   * @param flags Schema flags.
   * @returns Constructed schema entry.
   */
  (flags: SchemaFlags): SchemaEntry;

}
