import { Command } from "commander";

const program = new Command();

program
  .name("ub")
  .description("Official CLI for urBackend")
  .version("0.1.0");

program.parse();