import { Schema, SchemaEntryFn, SchemaFlags, StructSchema } from '@prekladyher/engine-base';

const LanguageSourceAsset: StructSchema = [
  { name: "m_GameObject", type: "Base" },
  { name: "mSource", type: "LanguageSourceData" },
];

const LanguageSourceData: StructSchema = [
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
];

// Based on Arkham Horror (not sure why the structure is reordered)
const LanguageSourceData_Reorder: StructSchema = [
  { name: "Google_WebServiceURL", type: "string", },
  { name: "Google_SpreadsheetKey", type: "string" },
  { name: "Google_SpreadsheetName", type: "string" },
  { name: "Google_LastUpdatedVersion", type: "string" },
  { name: "GoogleUpdateFrequency", type: "int" },
  { name: "GoogleUpdateDelay", type: "float", value: 0 },
  { name: "mTerms", type: "TermData[]" },
  { name: "mLanguages", type: "LanguageData[]" },
  { name: "CaseInsensitiveTerms", type: "uint8" },
  { name: "Assets", type: "PPtr[]" },
  { name: "NeverDestroy", type: "uint8" },
  { name: "UserAgreesToHaveItOnTheScene", type: "uint8", value: 0 },
  { name: "UserAgreesToHaveItInsideThePluginsFolder", type: "uint8", value: 0 },
  { name: "OnMissingTranslation", type: "int", value: 1 },
];

const TermData: SchemaEntryFn = (flags: SchemaFlags) => [
  { name: "Term", type: "string" },
  { name: "TermType", type: "int" },
  ...(flags["TermData.Description"] ? [{ name: "Description", type: "string" }] : []),
  { name: "Languages", type: "string[]" },
  { name: "Flags", type: "uint8[]" },
  { name: "Languages_Touch", type: "string[]" },
];

const LanguageData: StructSchema = [
  { name: "Name", type: "string" },
  { name: "Code", type: "string" },
  { name: "Flags", type: "uint8" },
];

export default function createSchema(flags: SchemaFlags): Schema {
  return {
    LanguageSourceAsset,
    LanguageSourceData: flags['LanguageSourceAsset.Reorder'] ? LanguageSourceData_Reorder : LanguageSourceData,
    TermData: TermData(flags),
    LanguageData
  };
}
