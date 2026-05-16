import { MegaStoneItemName } from './mega-stone-names';
import { RegularItemName } from './regular-item-names';

export type { MegaStoneItemName } from './mega-stone-names';
export { isMegaStoneItemName, megaStoneItemNames } from './mega-stone-names';
export type { RegularItemName } from './regular-item-names';

export type ItemName = RegularItemName | MegaStoneItemName;