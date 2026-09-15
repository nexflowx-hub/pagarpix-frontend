import { readFile } from "node:fs/promises";

const reports = [
  ["Baseline PROD", "lighthouse-reports/before-production.json"],
  ["Branch V2.5", "lighthouse-reports/after-local.json"],
];

for (const [label, path] of reports) {
  const report = JSON.parse(await readFile(path, "utf8"));
  const categories = report.categories;
  const result = {
    performance: Math.round(categories.performance.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    bestPractices: Math.round(categories["best-practices"].score * 100),
    seo: Math.round(categories.seo.score * 100),
  };
  console.log(`${label}: ${JSON.stringify(result)}`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFile } = await import("node:fs/promises");
    await appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      `| ${label} | ${result.performance} | ${result.accessibility} | ${result.bestPractices} | ${result.seo} |\n`,
    );
  }
}
