/**
 * Type dictionary aka. schema.
 */
export type Schema = Record<string, SchemaEntryFn | SchemaEntry>;

/**
 * Schema flags to support different file versions.
 */
export type SchemaFlags = Record<string, boolean>;

/**
 * Schema entry factory function.
 */
export interface SchemaEntryFn {

  /**
   * Create schema entry based on the provided flags.
   * @param flags Schema version flags.
   * @return Created schema entry.
   */
  (flags: SchemaFlags): SchemaEntry;

}

/**
 * Single type definition.
 */
export type SchemaEntry = StructSchema | ObjectSchema;

/**
 * Struct type schema.
 */
export type StructSchema = StructMemberSchema[];

/**
 * Struct type member.
 */
export interface StructMemberSchema {

 /**
  * Struct member name.
  */
  name: string;

  /**
   * Struct member type tag.
   */
  type: string;

  /**
   * Default member value.
   */
  value?: unknown;

  /**
   * Value assertion callback.
   */
  assert?: StructAssertFn;

}

/**
 * Struct member value validation method.
 */
export interface StructAssertFn {

  /**
   * Check that the provided value is not somethig unexpected.
   * @param value Parsed struct member value.
   * @param schema Schema for the stuct member that is being checked.
   * @returns True if the value is to be considered valid, false otherwise.
   */
  (value: unknown, schema: StructMemberSchema): boolean;

}

/**
 * Mapped object type schema.
 */
export interface ObjectSchema {

  /**
   * Struct defining object state layout.
   */
  layout: StructSchema;

  /**
   * Restore object state from loaded data.
   */
  restore: (loaded: object) => unknown;

  /**
   * Persist object state.
   */
  persist: (object: unknown) => object;

}
