import { IMarkerSearchQuery, searchMarkers } from "../../../search/marker";
import Marker from "../../../types/marker";
import * as logger from "../../../utils/logger";

export async function getMarkers(
  _: unknown,
  { query, seed }: { query: Partial<IMarkerSearchQuery>; seed?: string }
): Promise<
  | {
      numItems: number;
      numPages: number;
      items: (Marker | null)[];
    }
  | undefined
> {
  try {
    const timeNow = +new Date();
    const result = await searchMarkers(query, seed);

    logger.log(
      `Search results: ${result.max_items} hits found in ${(Date.now() - timeNow) / 1000}s`
    );

    const markers = await Marker.getBulk(result.items);
    logger.log(`Search done in ${(Date.now() - timeNow) / 1000}s.`);

    return {
      numItems: result.max_items,
      numPages: result.num_pages,
      items: markers.filter(Boolean),
    };
  } catch (error) {
    logger.error(error);
  }
}
