import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TOOLS } from '../src/lib/tools.ts'; // Node doesn't run TS directly easily.

// Just parse tools.ts as text to avoid TS/ESM issues
