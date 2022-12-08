# L10n Toolbox

Toolbox with scripts to manipulate various game data files to help with fan based localization.


# Using Command Line Tools

Discover available commands with the following:

```bash
npx @prekladyher/l10n-toolbox --help
```

### Example Invocations

Extract language data from Disco Elysium's asset:

```bash
npx @prekladyher/l10n-toolbox unity read -j -t LanguageSourceAsset -i GeneralLockitEnglish.dat > General.json
```

Generate back asset from the JSON file:

```
npx @prekladyher/l10n-toolbox unity write -j -t LanguageSourceAsset -i General.json -o GeneralLockitCustom.dat
```

## Invoking Commands During Development

You can test commands durng development with the following:

```bash
npm install && npm run -ws build
npx ./packages/toolbox --help
```
