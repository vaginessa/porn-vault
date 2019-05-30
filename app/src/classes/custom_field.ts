export enum CustomFieldType {
  STRING, NUMBER, BOOLEAN, SELECT, MULTI_SELECT
}

export default class CustomField {
  name: string = "";
  values: string[] | null = null;
  type: CustomFieldType = CustomFieldType.STRING;

  static create(name: string, values: string[] | null, type: CustomFieldType) {
    let field = new CustomField();
    field.name = name;
    field.values = values;
    field.type = type;
    return field;
  }
}