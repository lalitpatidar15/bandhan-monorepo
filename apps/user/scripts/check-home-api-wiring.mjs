import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = ["TrendingProducts.tsx", "FeaturedServices.tsx", "FeaturedVenues.tsx", "ReviewsSection.tsx"];

for (const file of files) {
  const source = await readFile(new URL(`../components/home/${file}`, import.meta.url), "utf8");
  assert.match(source, /useGet(?:LandingCatalogue|FeaturedReviews)Query/, `${file} must read a public API query`);
}

const joined = await Promise.all(files.map((file) => readFile(new URL(`../components/home/${file}`, import.meta.url), "utf8"))).then((values) => values.join("\n"));
for (const demoName of ["Gold Ganesh idol", "Eternal Moments Photography", "Grand Palace Banquet", "Priya S.", "2,400+"]) {
  assert.doesNotMatch(joined, new RegExp(demoName), `demo record remains in home catalogue: ${demoName}`);
}

console.log("Home catalogue sections are API-backed and contain no legacy demo records.");
