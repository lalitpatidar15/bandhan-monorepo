const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const ignoredDirectories = new Set([".git", "node_modules"]);
const files = [];

function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(target);
    else if (entry.name.endsWith(".js")) files.push(target);
  }
}

function hasExactCase(target) {
  const parsed = path.parse(target);
  let current = parsed.root;

  for (const segment of path.relative(parsed.root, target).split(path.sep)) {
    if (!fs.readdirSync(current).includes(segment)) return false;
    current = path.join(current, segment);
  }

  return true;
}

function resolveRelativeImport(file, request) {
  const target = path.resolve(path.dirname(file), request);
  const candidates = [target, `${target}.js`, path.join(target, "index.js")];
  return candidates.find((candidate) => {
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
}

collect(root);
const failures = [];

for (const file of files) {
  const relativeFile = path.relative(root, file);
  const source = fs.readFileSync(file, "utf8");
  const syntax = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });

  if (syntax.status !== 0) {
    failures.push(`${relativeFile}: ${syntax.stderr.trim() || "invalid syntax"}`);
  }

  if (/^(?:<<<<<<<|>>>>>>>) /m.test(source)) {
    failures.push(`${relativeFile}: unresolved merge marker`);
  }

  const exportedNames = new Set();
  for (const match of source.matchAll(/^exports\.([A-Za-z_$][\w$]*)\s*=/gm)) {
    if (exportedNames.has(match[1])) {
      failures.push(`${relativeFile}: duplicate controller export ${match[1]}`);
    }
    exportedNames.add(match[1]);
  }

  for (const match of source.matchAll(/require\(["'](\.[^"']+)["']\)/g)) {
    const resolved = resolveRelativeImport(file, match[1]);
    if (!resolved) failures.push(`${relativeFile}: missing import ${match[1]}`);
    else if (!hasExactCase(resolved)) {
      failures.push(`${relativeFile}: import has incorrect letter case: ${match[1]}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

require(path.join(root, "app"));
console.log(`Validated ${files.length} JavaScript files and loaded the Express app.`);
