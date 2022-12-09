# Game Engine Tools

Components for reading and modifying game engine files.

File manipulation is done via registered type handlers that are capable of converting binary data (buffers) to JavaScript objects and vice versa.

Exported ESM subpaths are:

* `base` - basic parsing and writing infrastructure together with all the necessary type declarations
* `unity` - common data types for Unity game engine
* `unreal` - common data types for Unreal Engine

Core components that participate in asset serialization and deserialization are:

* `TypeHandler` - reader/writer for a specific data type
* `TypeRegistry` - map of registered types
* `TypeResolver` - encapsulates logic of retrieving type handler based on lookup parameters

Components follow very simple naming logic:

* `createResolver()` - factory method for `TypeResolver`
* `define...()` - factory method for a specific `TypeHandler`
* `register...()` - meta factory method for parametrized `TypeHandler`s
