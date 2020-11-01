export interface Extractor {
  filterMatchingInputs: (inputs: string[], path: string) => string[];
}
