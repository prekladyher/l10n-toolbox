# L10n Toolbox

Toolbox with scripts to manipulate various game data files to help with fan based localization.

## Running CLI Tools

You must install dependencies and compile TypeScript sources before running any CLI tools:

```bash
npm install && npm run -ws build
```

After this step you can run NodeJS scripts in `packages/cli-*` packages. Simply call `help` command
on any CLI package to discover its capabilities:

```bash
npx ./packages/cli-unity help
```

### Example Invocations

Extract language data from Disco Elysium's asset:

```bash
npx ./packages/cli-unity read -j -t LanguageSourceAsset -i GeneralLockitEnglish.dat > General.json
```

Generate back asset from the JSON file:

```
npx ./packages/cli-unity write -j -t LanguageSourceAsset -i General.json -o GeneralLockitCustom.dat
```
