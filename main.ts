import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

// Load environment variables
import "$std/dotenv/load.ts";

// Start the Fresh server
console.log("Starting CRITICO web application");
await start(manifest, config);
