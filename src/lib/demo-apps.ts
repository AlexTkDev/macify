export type DemoApplication = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  category: string;
  pricing: string;
  source: "Open source" | "Closed source";
  minimumMacos: string;
  tags: string[];
  relatedSlugs: string[];
};

export const demoApplications: DemoApplication[] = [
  { slug: "luma-dock", name: "LumaDock", tagline: "Keep active projects within reach from the Dock.", summary: "LumaDock groups project files, links, and recent documents into focused Dock menus.", description: "## A project shelf for the Dock\n\nLumaDock creates a compact shelf for every active project. Each shelf can contain files, folders, URLs, and short notes.\n\n- Open project material from one place\n- Pin frequently used folders\n- Archive a shelf when work is complete", category: "Productivity", pricing: "Paid once", source: "Closed source", minimumMacos: "macOS 14", tags: ["dock", "projects", "launcher"], relatedSlugs: ["threadline", "shelfspace", "quietbar"] },
  { slug: "threadline", name: "Threadline", tagline: "Turn scattered tasks into a clear daily sequence.", summary: "Threadline is a lightweight task planner organized around the order work should happen.", description: "## Plan the sequence, not just the list\n\nThreadline arranges tasks as a daily thread. Drag work into order, add a time estimate, and hide everything after the current item.\n\nIt is designed for people who find large task databases distracting.", category: "Productivity", pricing: "Freemium", source: "Closed source", minimumMacos: "macOS 13", tags: ["tasks", "planning", "focus"], relatedSlugs: ["luma-dock", "minute-glass", "draftwell"] },
  { slug: "quietbar", name: "QuietBar", tagline: "Hide menu bar clutter without losing useful controls.", summary: "QuietBar organizes menu bar items into visible, hidden, and always-available groups.", description: "## A calmer menu bar\n\nQuietBar keeps essential status items visible and moves everything else behind one predictable control. Layouts can change automatically when an external display is connected.", category: "Utilities", pricing: "Paid once", source: "Closed source", minimumMacos: "macOS 13", tags: ["menu bar", "organization", "display"], relatedSlugs: ["luma-dock", "signal-pane", "window-weave"] },
  { slug: "window-weave", name: "WindowWeave", tagline: "Build reusable window arrangements for each workspace.", summary: "WindowWeave saves application layouts and restores them across displays and Spaces.", description: "## Repeatable workspaces\n\nCapture a window arrangement once, then restore it with a keyboard shortcut. WindowWeave adapts layouts when a monitor is missing instead of placing windows off-screen.", category: "Utilities", pricing: "Open source", source: "Open source", minimumMacos: "macOS 12", tags: ["windows", "shortcuts", "displays"], relatedSlugs: ["quietbar", "luma-dock", "signal-pane"] },
  { slug: "pixel-nest", name: "PixelNest", tagline: "Collect visual references beside the work they inspire.", summary: "PixelNest is a local reference board for screenshots, colors, type samples, and annotations.", description: "## References that stay local\n\nDrop images, text fragments, and color values onto flexible boards. PixelNest stores original files locally and exports a board as a portable package.", category: "Design", pricing: "Subscription", source: "Closed source", minimumMacos: "macOS 14", tags: ["references", "moodboard", "color"], relatedSlugs: ["frame-sift", "draftwell", "shelfspace"] },
  { slug: "frame-sift", name: "FrameSift", tagline: "Compare interface screenshots with precise visual controls.", summary: "FrameSift overlays, aligns, and compares screenshots for detailed interface review.", description: "## Inspect visual differences\n\nCompare two interface captures using opacity, difference, and side-by-side modes. Alignment guides and measurement tools help identify spacing drift quickly.", category: "Design", pricing: "Free", source: "Closed source", minimumMacos: "macOS 13", tags: ["screenshots", "comparison", "interface"], relatedSlugs: ["pixel-nest", "signal-pane", "syntax-garden"] },
  { slug: "syntax-garden", name: "SyntaxGarden", tagline: "Keep small code experiments organized and runnable.", summary: "SyntaxGarden stores focused code experiments with notes, dependencies, and reproducible commands.", description: "## A home for small experiments\n\nCreate isolated snippets without turning each idea into a full repository. Every garden records its runtime, packages, and launch command.", category: "Development", pricing: "Open source", source: "Open source", minimumMacos: "macOS 13", tags: ["code", "snippets", "experiments"], relatedSlugs: ["signal-pane", "frame-sift", "vaultleaf"] },
  { slug: "signal-pane", name: "SignalPane", tagline: "Watch local services without keeping terminal windows open.", summary: "SignalPane monitors development ports, health endpoints, and recent process output from the menu bar.", description: "## Local service visibility\n\nSee which development services are running, inspect their latest health result, and open the correct local URL. SignalPane never sends process information off the Mac.", category: "Development", pricing: "Freemium", source: "Closed source", minimumMacos: "macOS 14", tags: ["localhost", "monitoring", "menu bar"], relatedSlugs: ["syntax-garden", "quietbar", "window-weave"] },
  { slug: "draftwell", name: "Draftwell", tagline: "Write connected Markdown notes without managing a system.", summary: "Draftwell combines plain Markdown files with fast links, backlinks, and a focused writing surface.", description: "## Plain files, useful connections\n\nDraftwell watches a folder of Markdown documents and adds navigation without changing the files. Notes remain usable in any text editor.\n\n- Wiki-style links\n- Backlink summaries\n- Command palette navigation", category: "Writing", pricing: "Paid once", source: "Closed source", minimumMacos: "macOS 13", tags: ["markdown", "notes", "backlinks"], relatedSlugs: ["shelfspace", "threadline", "pixel-nest"] },
  { slug: "shelfspace", name: "Shelfspace", tagline: "Save research material with enough context to use it later.", summary: "Shelfspace captures articles, quotations, and links into topic-based local research shelves.", description: "## Research with context\n\nEvery saved item includes the source, selected text, and a short note explaining why it matters. Export a shelf to Markdown when it is time to write.", category: "Writing", pricing: "Subscription", source: "Closed source", minimumMacos: "macOS 14", tags: ["research", "reading", "markdown"], relatedSlugs: ["draftwell", "pixel-nest", "vaultleaf"] },
  { slug: "minute-glass", name: "MinuteGlass", tagline: "Use gentle time boundaries without blocking your Mac.", summary: "MinuteGlass provides visible work intervals, short reset prompts, and private local history.", description: "## Time boundaries without punishment\n\nMinuteGlass places a quiet progress indicator near the menu bar. At the end of an interval it suggests a short reset instead of locking applications.", category: "Focus", pricing: "Free", source: "Closed source", minimumMacos: "macOS 12", tags: ["timer", "breaks", "focus"], relatedSlugs: ["threadline", "quietbar", "vaultleaf"] },
  { slug: "vaultleaf", name: "Vaultleaf", tagline: "Keep temporary sensitive notes out of permanent documents.", summary: "Vaultleaf stores short encrypted notes that expire automatically after a chosen period.", description: "## Notes designed to disappear\n\nUse Vaultleaf for temporary recovery details, handoff notes, and information that should not remain in a general notes app. Expiration is enforced locally.", category: "Focus", pricing: "Paid once", source: "Closed source", minimumMacos: "macOS 13", tags: ["privacy", "temporary notes", "encryption"], relatedSlugs: ["minute-glass", "draftwell", "syntax-garden"] },
];

export const demoCategories = Array.from(new Set(demoApplications.map((app) => app.category)));

export function getDemoApplication(slug: string) {
  return demoApplications.find((app) => app.slug === slug) ?? null;
}

export function getDemoRelatedApplications(slug: string) {
  const application = getDemoApplication(slug);
  if (!application) return [];
  return demoApplications.filter((candidate) =>
    candidate.slug !== slug &&
    (application.relatedSlugs.includes(candidate.slug) || candidate.relatedSlugs.includes(slug)),
  );
}
