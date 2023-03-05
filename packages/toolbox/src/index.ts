import { program } from 'commander';
import { program as anvil } from './engine/anvil.js';
import { program as unity } from './engine/unity.js';
import { program as unreal } from './engine/unreal.js';
import { program as json } from './format/json.js';

program.addCommand(anvil);
program.addCommand(unity);
program.addCommand(unreal);
program.addCommand(json);

program.parse();
