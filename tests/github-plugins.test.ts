import test from "node:test";
import assert from "node:assert/strict";
import {
  CURATED_GITHUB_PLUGINS,
  searchPlugins,
  createCustomPlugin,
  formatCloneCommand,
  validateGitHubRepoString,
  toggleBookmarkPlugin,
  GitHubRepoPlugin,
  GitHubPluginCategory,
} from "../src/lib/github-plugins";

test("GitHub Plugins — Curated Catalog Integrity", () => {
  assert.ok(CURATED_GITHUB_PLUGINS.length >= 15, "Should have at least 15 curated free GitHub repos");

  for (const plugin of CURATED_GITHUB_PLUGINS) {
    assert.ok(plugin.id, "Plugin must have an id");
    assert.ok(plugin.title, "Plugin must have a title");
    assert.ok(plugin.repo, "Plugin must specify an owner/repo");
    assert.ok(plugin.url.startsWith("https://github.com/"), "Plugin URL must be a valid GitHub link");
    assert.ok(plugin.stars, "Plugin must list approximate stars");
    assert.ok(plugin.category, "Plugin must belong to a valid category");
    assert.ok(plugin.description, "Plugin must have a description");
    assert.ok(Array.isArray(plugin.tags) && plugin.tags.length > 0, "Plugin must have tags");
  }
});

test("GitHub Plugins — Search & Category Filtering", () => {
  // Test category filter
  const antagravityPlugins = searchPlugins(CURATED_GITHUB_PLUGINS, "", "Google Antigravity & AI");
  assert.ok(antagravityPlugins.length > 0);
  assert.ok(antagravityPlugins.every((p) => p.category === "Google Antigravity & AI"));

  // Test keyword search
  const vibeResults = searchPlugins(CURATED_GITHUB_PLUGINS, "prompt", "All");
  assert.ok(vibeResults.length > 0);
  assert.ok(
    vibeResults.some(
      (p) =>
        p.title.toLowerCase().includes("prompt") ||
        p.description.toLowerCase().includes("prompt") ||
        p.tags.some((t) => t.toLowerCase().includes("prompt"))
    )
  );

  // Test empty query returns all
  const allResults = searchPlugins(CURATED_GITHUB_PLUGINS, "", "All");
  assert.equal(allResults.length, CURATED_GITHUB_PLUGINS.length);
});

test("GitHub Plugins — Clone Command & Repo Validation", () => {
  assert.equal(
    formatCloneCommand("google-gemini/cookbook"),
    "git clone https://github.com/google-gemini/cookbook.git"
  );
  assert.equal(
    formatCloneCommand("https://github.com/shadcn-ui/ui"),
    "git clone https://github.com/shadcn-ui/ui.git"
  );

  assert.equal(validateGitHubRepoString("owner/repo"), true);
  assert.equal(validateGitHubRepoString("https://github.com/owner/repo"), true);
  assert.equal(validateGitHubRepoString(""), false);
  assert.equal(validateGitHubRepoString("invalid-no-slash"), false);
});

test("GitHub Plugins — Custom Plugin Creation", () => {
  const custom = createCustomPlugin({
    title: "Awesome Vibe Coding Repo",
    repo: "user/vibe-coding-starter",
    category: "Vibe Coding & Prompting",
    description: "Personal curated vibe coding templates",
    tags: ["vibe", "ai", "starter"],
  });

  assert.ok(custom.id.startsWith("custom_"));
  assert.equal(custom.title, "Awesome Vibe Coding Repo");
  assert.equal(custom.repo, "user/vibe-coding-starter");
  assert.equal(custom.url, "https://github.com/user/vibe-coding-starter");
  assert.equal(custom.category, "Vibe Coding & Prompting");
  assert.equal(custom.isCustom, true);
  assert.equal(custom.stars, "Custom ★");
});

test("GitHub Plugins — Bookmarking / Starring Logic", () => {
  let bookmarks: string[] = [];
  bookmarks = toggleBookmarkPlugin(bookmarks, "repo_gemini_cookbook");
  assert.deepEqual(bookmarks, ["repo_gemini_cookbook"]);

  // Toggle off
  bookmarks = toggleBookmarkPlugin(bookmarks, "repo_gemini_cookbook");
  assert.deepEqual(bookmarks, []);
});
