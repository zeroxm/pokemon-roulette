import { ItemName } from "../services/item-sprite-service/item-names";
import { WheelItem } from "./wheel-item";

export interface ItemItem extends WheelItem {
  name: ItemName;
  sprite: string;
}