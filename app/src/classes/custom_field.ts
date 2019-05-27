export enum CustomFieldType {
  STRING, NUMBER, BOOLEAN, SELECT, MULTI_SELECT
}

export default class CustomField {
  name: string = "";
  value: string | number | boolean = "";
  type: CustomFieldType = CustomFieldType.STRING;

  static create(name: string, value: string | number, type: CustomFieldType) {
    let field = new CustomField();
    field.name = name;
    field.value = value;
    field.type = type;
    return field;
  }
}