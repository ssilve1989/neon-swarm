# Technical Preferences

<!-- Populated by /setup-engine. Updated as the user makes decisions throughout development. -->
<!-- All agents reference this file for project-specific standards and conventions. -->

## Engine & Language

- **Engine**: [TO BE CONFIGURED — run /setup-engine]
- **Language**: [TO BE CONFIGURED]
- **Rendering**: [TO BE CONFIGURED]
- **Physics**: [TO BE CONFIGURED]

## Naming Conventions

- **Classes**: [TO BE CONFIGURED]
- **Variables**: [TO BE CONFIGURED]
- **Signals/Events**: [TO BE CONFIGURED]
- **Files**: [TO BE CONFIGURED]
- **Scenes/Prefabs**: [TO BE CONFIGURED]
- **Constants**: [TO BE CONFIGURED]

## Performance Budgets

- **Target Framerate**: 60 fps (all tiers)
- **Frame Budget**: 16.67ms
- **Draw Calls**: ~1 (PixiJS batches all particles into a single draw call via Container + shared texture)
- **Memory Ceiling**: [TO BE CONFIGURED]

### Particle Budget by Device Tier

Tier classification is determined at startup by `src/utils/device-tier.ts`.

| Tier | Viewport Width | Particle Count | Density (per 1000 px²) |
|------|---------------|----------------|------------------------|
| Mobile | ≤ 768px | 1,000 | ~2.7 |
| Tablet | 769–1199px | 3,000 | ~4.0 |
| Desktop | ≥ 1200px | 10,000 | ~4.8 |

Tier is read-once at page load. A page reload is required for tier changes (e.g. orientation change).

## Testing

- **Framework**: [TO BE CONFIGURED]
- **Minimum Coverage**: [TO BE CONFIGURED]
- **Required Tests**: Balance formulas, gameplay systems, networking (if applicable)

## Forbidden Patterns

<!-- Add patterns that should never appear in this project's codebase -->
- [None configured yet — add as architectural decisions are made]

## Allowed Libraries / Addons

<!-- Add approved third-party dependencies here -->
- [None configured yet — add as dependencies are approved]

## Architecture Decisions Log

<!-- Quick reference linking to full ADRs in docs/architecture/ -->
- [No ADRs yet — use /architecture-decision to create one]
