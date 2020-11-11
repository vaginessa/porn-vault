export interface MatchSource {
  id: string;
  inputs: string[];
}

export interface Extractor {
  filterMatchingInputs: (inputs: MatchSource[], path: string) => string[];
}
