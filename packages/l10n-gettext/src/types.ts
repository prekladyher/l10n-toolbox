
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

export type CommentKey = typeof CommentType[keyof typeof CommentType];

/**
 * Message attributes.
 */
export interface MessageAttrs {

  msgctxt?: string;

  msgid: string;

  msgstr?: string;

};

/**
 * Single PO message entry.
 */
export interface PoMessage extends Partial<Record<CommentKey, string>>, MessageAttrs {
}
