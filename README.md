# L10n Toolbox

Toolbox with scripts to manipulate various game data files to help with fan based localization.

## Running Scripts

You must install dependencies and compile TypeScript sources before running any scripts:

```bash
npm install && npm run build -ws
```

After this step you can run NodeJS scripts in `scripts/` directory. Simply call `help` command
on any script to discover its capabilities:

```bash
node scripts/unity.js help
```

### Example Invocations

Extract language data from Disco Elysium's asset:

```bash
node scripts/unity.js read -j -t LanguageSourceAsset -i GeneralLockitEnglish.dat > General.json
```

Generate back asset from the JSON file:

```
node scripts/unity.js write -j -t LanguageSourceAsset -i General.json -o GeneralLockitCustom.dat
```
