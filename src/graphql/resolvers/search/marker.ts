import * as logger from "../../../logger";
import { searchMarkers } from "../../../search/marker";
import Marker from "../../../types/marker";

export async function getMarkers(_, { query, seed }: { query?: string; seed?: string }) {
  try {
    const timeNow = +new Date();
    const result = await searchMarkers(query || "", seed);

    logger.log(
      `Search results: ${result.max_items} hits found in ${(Date.now() - timeNow) / 1000}s`
    );

    const markers = await Promise.all(result.items.map(Marker.getById));
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
