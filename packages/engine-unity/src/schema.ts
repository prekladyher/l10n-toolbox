import { SchemaFlags } from "@prekladyher/engine-base/dist";

/**
 * Base Unity/MonoScript types.
 */
const BaseScript = {
  $EmptyArray: [
    { name: "size", type: "int", value: 0 },
  ],
  Base: [
    { name: "m_GameObject", type: "PPtr" /* GameObject */ },
    { name: "m_Enabled", type: "uint8", value: 1 },
    { name: "m_Script", type: "PPtr" /* MonoScript */ },
    { name: "m_Name", type: "string" },
  ],
  PPtr: [
    { name: "m_FileID", type: "uint32" },
    { name: "m_PathID", type: "uint64" },
  ],
  Vector2f: [
    { name: "x", type: "float" },
    { name: "y", type: "float" },
  ],
  Rectf: [
    { name: "x", type: "float" },
    { name: "y", type: "float" },
    { name: "width", type: "float" },
    { name: "height", type: "float" },
  ],
  ColorRGBA: [
    { name: "r", type: "float" },
    { name: "g", type: "float" },
    { name: "b", type: "float" },
    { name: "a", type: "float" },
  ],
  UnityEvent: [
    { name: "m_PersistentCalls", type: "PersistentCallGroup" }
  ],
  PersistentCallGroup: [
    { name: "m_Calls", type: "$EmptyArray" }
  ],
};

/**
 * LanguageSourceAsset types.
 *
 * Verified engines and games:
 * - Unity 5.4.10 / Disco Elysium: Final Cut
 */
const LanguageSourceAsset = {
  LanguageSourceAsset: [
    { name: "m_GameObject", type: "Base" },
    { name: "mSource", type: "LanguageSourceData" },
  ],
  LanguageSourceData: [
    { name: "UserAgreesToHaveItOnTheScene", type: "uint8", value: 0 },
    { name: "UserAgreesToHaveItInsideThePluginsFolder", type: "uint8", value: 0 },
    { name: "GoogleLiveSyncIsUptoDate", type: "uint8", value: 1 },
    { name: "mTerms", type: "TermData[]" },
    { name: "CaseInsensitiveTerms", type: "uint8" },
    { name: "OnMissingTranslation", type: "int", value: 1 },
    { name: "mTerm_AppName", type: "string", value: "" },
    { name: "mLanguages", type: "LanguageData[]" },
    { name: "IgnoreDeviceLanguage", type: "uint8" },
    { name: "_AllowUnloadingLanguages", type: "int", value: 0 },
    { name: "Google_WebServiceURL", type: "string", },
    { name: "Google_SpreadsheetKey", type: "string" },
    { name: "Google_SpreadsheetName", type: "string" },
    { name: "Google_LastUpdatedVersion", type: "string" },
    { name: "GoogleUpdateFrequency", type: "int" },
    { name: "GoogleInEditorCheckFrequency", type: "int" },
    { name: "GoogleUpdateSynchronization", type: "int" },
    { name: "GoogleUpdateDelay", type: "float", value: 0 },
    { name: "Assets", type: "PPtr[]" },
  ],
  TermData: (flags: SchemaFlags) => [
    { name: "Term", type: "string" },
    { name: "TermType", type: "int" },
    ...(flags["TermData.Description"] ? [{ name: "Description", type: "string" }] : []),
    { name: "Languages", type: "string[]" },
    { name: "Flags", type: "uint8[]" },
    { name: "Languages_Touch", type: "$EmptyArray" },
  ],
  LanguageData: [
    { name: "Name", type: "string" },
    { name: "Code", type: "string" },
    { name: "Flags", type: "uint8" },
  ],
};

export default {
  ...BaseScript,
  ...LanguageSourceAsset
};
