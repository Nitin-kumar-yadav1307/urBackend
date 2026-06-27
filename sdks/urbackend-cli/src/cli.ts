import { Command } from "commander";

import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { whoamiCommand } from "./commands/whoami.js";

const program = new Command();

program
  .name("ub")
  .description("Official CLI for urBackend")
  .version("0.1.0");

program
  .command("login")
  .description(
    "Authenticate using a Personal Access Token",
  )
  .action(loginCommand);

program
  .command("logout")
  .description(
    "Remove the local authentication",
  )
  .action(logoutCommand);

program
  .command("whoami")
  .description(
    "Display the authenticated developer",
  )
  .action(whoamiCommand);

program.parse();
