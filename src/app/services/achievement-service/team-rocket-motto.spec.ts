import de from '../../../assets/i18n/de.json';
import es from '../../../assets/i18n/es.json';
import fr from '../../../assets/i18n/fr.json';
// Not `it`: that is Jasmine's, and the import would shadow it.
import italian from '../../../assets/i18n/it.json';
import pt from '../../../assets/i18n/pt.json';

/**
 * The two Team Rocket achievements are named after the motto, so they have to *be* the
 * motto in whatever language the player is reading.
 *
 * They were literal translations of the English names before, which read as nothing in
 * particular: Spanish had "Prepárate para los Problemas" while the grunts on screen said
 * "No te asustes, niñito". The game already ships each locale's dub motto for the Team
 * Rocket encounter, so that is the source of truth here rather than a second translation
 * of the same joke.
 *
 * English is excluded on purpose: it is the wording every motto was localised *from*, and
 * "Make it Double" is the achievement name rather than the full "And make it double!" line.
 */
interface Bundle {
  achievements: Record<string, { name: string }>;
  game: { main: { roulette: { teamrocket: Record<string, unknown> } } };
}

// Through `unknown`: the JSON imports type as their own literal shape, which is narrower
// than what this spec needs to index into.
const LOCALES: Record<string, Bundle> = {
  de: de as unknown as Bundle,
  es: es as unknown as Bundle,
  fr: fr as unknown as Bundle,
  it: italian as unknown as Bundle,
  pt: pt as unknown as Bundle,
};

const PAIRS: readonly (readonly [string, string])[] = [
  ['prepare_for_trouble', 'trouble'],
  ['make_it_double', 'double'],
];

/** The motto lines are spoken lines, so they carry the punctuation the names drop. */
function spokenLineAsName(line: string): string {
  return line.trim().replace(/[!.]+$/, '').trim();
}

describe('Team Rocket achievement names', () => {
  for (const [locale, bundle] of Object.entries(LOCALES)) {
    for (const [achievementId, mottoKey] of PAIRS) {
      it(`${locale}: ${achievementId} reads as the localised motto`, () => {
        const motto = bundle.game.main.roulette.teamrocket[mottoKey];
        expect(typeof motto).toBe('string');

        expect(bundle.achievements[achievementId].name)
          .toBe(spokenLineAsName(motto as string));
      });
    }
  }
});
