# Planet project guidance

Read [PLANET_ANCHOR.md](PLANET_ANCHOR.md) first. It preserves the owner’s product scope: Galactus owns automatic repair and delegates equipment/layout problems to the Architect. Never make student troubleshooting or manual maintenance dispatch the normal recovery flow.

Planet is an educational workflow factory for ages 10+. The visual direction is an interactive Minecraft-inspired sci-fi warehouse: an actual cutaway room, original oversized-head anime collectible-style crew, octagonal details, chunky readable borders, and green/wood/stone materials. Alien terrain, plants, and planets belong outside the factory walls and windows.

The reference is https://github.com/androoAGI/starnet. Inspect its room-based workflow approach without copying third-party source or art unless licensing and attribution are addressed.

After completing each requested set of visual changes, provide a generated picture, as the user explicitly requested. Also provide an actual browser screenshot and distinguish it from the generated visualization. In this chat, tool images and workspace/sandbox image links did not reach the user. Verified HTTPS PNG URLs on the repository's `planet-preview` branch did work. Keep images accessible through that route and verify the URL serves the image before reporting delivery. Do not claim to have fixed Codex's client rendering settings.

Use the existing checkout; cloud tasks are isolated and do not need another worktree unless requested. Run `npm test` and `npm run build` for functional changes. Use Chromium browser checks for the 3D room, placement, practice completion, persistence, and responsive layout. Keep practice simulation separate from live model execution. Never expose server credentials in client code or previews. The local Node server is not an authenticated production deployment.
