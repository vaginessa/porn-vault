export interface Extractor {
  filterMatchingInputs: (inputs: string[], compare: string) => string[];
}
