# L10n Toolbox

Toolbox with scripts to manipulate various game data files to help with fan based localization.

## Running Scripts

You must install dependencies and compile TypeScript sources before running any scripts:

```bash
npm install && npm run build -ws
```

After this step you can run scripts via `npm exec`. For example to unpack localization asset
from Two Point Hospital run:

```bash
npm exec -- node scripts/unity.js read -j -f flags-unity.json LanguageSourceAsset <asset-file.dat>
```
