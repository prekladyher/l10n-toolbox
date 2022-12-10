
/**
 * Comment field types.
 */
export const CommentType = {

  TranslatorComments: '#',

  ExtractedComments: '#.',

  Reference: '#:',

  Flags: '#,',

  PreviousUntranslated: '#|'

} as const;

/**
 * Allowed comment keys.
 */
export type CommentKey = typeof CommentType[keyof typeof CommentType];

/**
 * Comment attributes.
 */
export type CommentAttrs = Partial<Record<CommentKey, string>>;

/**
 * Message attributes.
 */
export interface MessageAttrs {

  msgctxt?: string;

  msgid: string;

  msgstr?: string;

}

/**
 * Single PO message entry.
 */
export type PoMessage = CommentAttrs & MessageAttrs;
