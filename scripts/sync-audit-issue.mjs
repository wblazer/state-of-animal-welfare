import { readFile } from "node:fs/promises";

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index]?.replace(/^--/, "").replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = argv[index + 1];
    if (!name || value === undefined) throw new Error("Expected --report, --body, and --title arguments");
    options[name] = value;
  }
  return options;
}

async function githubRequest(endpoint, options = {}) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`GitHub API returned HTTP ${response.status}: ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

async function main() {
  const { report: reportPath, body: bodyPath, title } = parseArguments(process.argv.slice(2));
  if (!reportPath || !bodyPath || !title) throw new Error("Expected --report, --body, and --title arguments");
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPOSITORY) {
    throw new Error("GITHUB_TOKEN and GITHUB_REPOSITORY are required");
  }

  const [owner, repository] = process.env.GITHUB_REPOSITORY.split("/");
  const [report, body] = await Promise.all([
    readFile(reportPath, "utf8").then(JSON.parse),
    readFile(bodyPath, "utf8"),
  ]);
  const issues = await githubRequest(`/repos/${owner}/${repository}/issues?state=all&per_page=100`);
  const issue = issues.find((candidate) => !candidate.pull_request && candidate.title === title);

  if (report.summary.needsAttention) {
    if (issue) {
      await githubRequest(`/repos/${owner}/${repository}/issues/${issue.number}`, {
        method: "PATCH",
        body: JSON.stringify({ body, state: "open" }),
      });
      console.log(`Updated issue #${issue.number}.`);
    } else {
      const created = await githubRequest(`/repos/${owner}/${repository}/issues`, {
        method: "POST",
        body: JSON.stringify({ title, body }),
      });
      console.log(`Created issue #${created.number}.`);
    }
  } else if (issue?.state === "open") {
    await githubRequest(`/repos/${owner}/${repository}/issues/${issue.number}`, {
      method: "PATCH",
      body: JSON.stringify({ body, state: "closed", state_reason: "completed" }),
    });
    console.log(`Closed resolved issue #${issue.number}.`);
  } else {
    console.log("No audit issue needs updating.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
