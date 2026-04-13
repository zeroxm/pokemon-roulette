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

**Known deferred:** Double type-advantage modal on multi-slot leader encounters (BATTLE-02, E4BATTLE-02 partial)

**Archive:** `.planning/milestones/v1.0-ROADMAP.md` · `.planning/milestones/v1.0-REQUIREMENTS.md` · `v1.0-MILESTONE-AUDIT.md`
