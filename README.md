# L10n Toolbox

L10n Toolbox is an assortment of libraries and utility scripts to assist with fan based game localization.

The following features are provided by toolbox packages:

* game file manipulation such as reading and writing assets
* working with localization resources
* unified command line interface

Packages are published to GitHub NPM registry so to use them you need to have the following in your `.npmrc`:

```
@prekladyher:registry=https://npm.pkg.github.com
```

You can list all available toolbox commands by calling the following:

```bash
npx @prekladyher/l10n-toolbox --help
```

Alternatively you can build your own tools by using any of the available packages:

* `@prekladyher/l10n-toolbox-engine` - components for reading and writing engine files
* `@prekladyher/l10n-toolbox-gettext` - working with gettext PO files

Check source code in this repository for more information.


### Example CLI Invocations

Extract language data from Disco Elysium's asset:

```bash
npx @prekladyher/l10n-toolbox unity read -j -t LanguageSourceAsset -i GeneralLockitEnglish.dat > General.json
```

Generate back asset from the JSON file:

```bash
npx @prekladyher/l10n-toolbox unity write -j -t LanguageSourceAsset -i General.json -o GeneralLockitCustom.dat
```

## Invoking Commands During Development

Before working with the project you need to install dependencies and build the packages:

```bash
npm install && npm run -ws build
npx @prekladyher/l10n-toolbox --help
```
