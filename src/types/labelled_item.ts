import { collections } from "../database/index";
import { generateHash } from "../utils/hash";

export default class LabelledItem {
  _id: string;
  label: string;
  item: string;
  type: string;

  constructor(item: string, label: string, type: string) {
    this._id = `li_${generateHash()}`;
    this.item = item;
    this.label = label;
    this.type = type;
  }

  static async getAll(): Promise<LabelledItem[]> {
    return collections.labelledItems.getAll();
  }

  static async getByLabel(label: string): Promise<LabelledItem[]> {
    return collections.labelledItems.query("label-index", label);
  }

  static async getByItem(item: string): Promise<LabelledItem[]> {
    return collections.labelledItems.query("item-index", item);
  }

  static async getByType(type: string): Promise<LabelledItem[]> {
    return collections.labelledItems.query("type-index", type);
  }

  static async get(from: string, to: string): Promise<LabelledItem | undefined> {
    const fromReferences = await collections.labelledItems.query("item-index", from);
    return fromReferences.find((r) => r.label === to);
  }

  static async removeByLabel(id: string): Promise<void> {
    for (const ref of await LabelledItem.getByLabel(id)) {
      await LabelledItem.removeById(ref._id);
    }
  }

  static async removeByItem(id: string): Promise<void> {
    for (const ref of await LabelledItem.getByItem(id)) {
      await LabelledItem.removeById(ref._id);
    }
  }

  static async remove(itemId: string, labelId: string): Promise<void> {
    const ref = await LabelledItem.get(itemId, labelId);
    if (ref) {
      await LabelledItem.removeById(ref._id);
    }
  }

  static async removeById(_id: string): Promise<void> {
    await collections.labelledItems.remove(_id);
  }
}
