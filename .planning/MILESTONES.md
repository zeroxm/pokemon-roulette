# Milestones

## v1.0 — Type Matchup Milestone ✅ SHIPPED 2026-04-13

**6 phases · 6 plans · 33 files changed · 18 commits**  
**Branch:** `28-pokémon-types-on-battles`

Made Pokémon types mechanically meaningful in gym and Elite Four battles. Type advantage shifts wheel odds (+3/+2 yes or +1/+2 no) and shows a modal explaining why — turning team building into genuine strategy.

**Shipped:**
- `type-matchups.json` — 18-type effectiveness table, statically bundled
- `TypeMatchupService` — injectable service: `calcTeamMatchup`, `getAdvantageLabel`
- Types on all 72 gym leaders and 36 Elite Four members (9 gens each)
- Wheel weight adjustments + type advantage modal in both battle components
- PC-swap live recalculation and modal re-show
- 5 i18n keys × 6 locales (en, de, es, fr, it, pt)

## v1.1 — Inline Type Matchup Display ✅ SHIPPED 2026-04-13

**2 phases · 4 plans · 13 source files · 18 commits**  
**Branch:** `28-pokémon-types-on-battles`

Replaced the type advantage modal with a persistent inline matchup strip in both gym and Elite Four battles. Column layout: leader type icon(s) → advantage label → relevant team type icons. Live-updates on PC team swap. Double-modal bug on multi-slot leaders resolved as a side effect.

**Shipped:**
- `TypeMatchupService.getMatchupTypes()` — returns typed advantageTypes/disadvantageTypes arrays
- Inline strip in both battle components — @if/@for Angular block syntax, no new components
- Removed typeAdvantageModal + queueTypeAdvantageModal from both components
- Stripped orphaned strong/weak i18n keys from all 6 locale files
- Mobile-safe flex-wrap layout with proportional 20px type icons

**Archive:** `.planning/milestones/v1.1-ROADMAP.md` · `.planning/milestones/v1.1-REQUIREMENTS.md`

---
