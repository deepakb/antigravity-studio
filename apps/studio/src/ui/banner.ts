import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";
import boxen from "boxen";

export function printBanner(version: string): void {
  const title = figlet.textSync("Nexus", { font: "Standard" });
  const coloredTitle = gradient(["#00DBDE", "#FC00FF"]).multiline(title);

  console.log(coloredTitle);
  console.log(
    boxen(
      chalk.bold("Enterprise AI Agent Toolkit for TypeScript") +
        "\n" +
        chalk.dim(`Version ${version}`),
      {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderStyle: "round",
        borderColor: "cyan",
        dimBorder: true,
      }
    )
  );
}

export function printWelcome(projectName: string, commandsList: string[]): void {
  const message =
    chalk.bold.green("✓ All done! Your enterprise AI toolkit is ready.") +
    "\n\n" +
    chalk.dim("Project: ") +
    chalk.cyan(projectName) +
    "\n\n" +
    chalk.bold.white("Slash Commands Available:") +
    "\n" +
    commandsList
      .map((c) => chalk.cyan(` • ${c}`))
      .join("\n") +
    "\n\n" +
    chalk.dim("Run ") +
    chalk.cyan("studio validate") +
    chalk.dim(" to run your first quality gate");

  console.log(
    boxen(message, {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: "double",
      borderColor: "green",
    })
  );
}
