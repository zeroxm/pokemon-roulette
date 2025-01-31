import { ItemName } from "../services/items-service/item-names";
import { WheelItem } from "./wheel-item";

export interface ItemItem extends WheelItem {
  name: ItemName;
  sprite: string;
  description: string;
}