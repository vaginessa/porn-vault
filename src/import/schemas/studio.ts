import Schema from "validate";

import { limitRating, stringArray, validCustomFields } from "./common";

export const studioSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  parent: {
    type: String,
    required: false,
  },
  aliases: stringArray(false),
  thumbnail: {
    type: String,
    required: false,
  },
  rating: {
    type: Number,
    required: false,
    use: { limitRating },
  },
  labels: stringArray(false),
  bookmark: {
    required: false,
    type: Number,
  },
  favorite: {
    required: false,
    type: Boolean,
  },
  customFields: {
    required: false,
    type: Object,
    use: { validCustomFields },
  },
});
