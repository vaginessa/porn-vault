import ora from "ora";

import { logger } from "../../utils/logger";
import { getClient, indexBuildInfoMap, IndexBuildStatus } from "..";

const DEFAULT_INDEX_SLICE_SIZE = 5000;

export type ProgressCallback = (progressCb: {
  indexedCount: number;
  totalToIndexCount: number;
}) => void;

export async function addSearchDocs<IndexItemType extends { id: string }>(
  index: string,
  docs: IndexItemType[]
): Promise<void> {
  if (!docs.length) {
    return;
  }

  logger.debug(`Indexing ${docs.length} items...`);
  const timeNow = +new Date();
  await getClient().bulk({
    body: docs.flatMap((doc) => [
      {
        index: {
          _id: doc.id,
          _index: index,
        },
      },
      doc,
    ]),
    refresh: true,
  });
  logger.debug(`ES indexing done in ${(Date.now() - timeNow) / 1000}s`);
}

export async function indexItems<CollectionType, IndexItemType>(
  items: CollectionType[],
  createSearchDoc: (item: CollectionType) => Promise<IndexItemType>,
  addSearchDocs: (indexItems: IndexItemType[]) => Promise<void>,
  progressCb?: ProgressCallback
): Promise<number> {
  let docsToIndex: IndexItemType[] = [];
  let indexedItemCount = 0;

  async function doAddSearchDocs() {
    await addSearchDocs(docsToIndex);
    indexedItemCount += docsToIndex.length;
    docsToIndex = [];
    if (progressCb) {
      progressCb({
        indexedCount: indexedItemCount,
        totalToIndexCount: items.length,
      });
    }
  }

  for (const item of items) {
    docsToIndex.push(await createSearchDoc(item));

    if (docsToIndex.length === DEFAULT_INDEX_SLICE_SIZE) {
      await doAddSearchDocs();
    }
  }
  if (docsToIndex.length) {
    await doAddSearchDocs();
  }
  return indexedItemCount;
}

export async function buildIndex<CollectionType>(
  indexName: string,
  getAllCollectionItems: () => Promise<CollectionType[]>,
  indexer: (collectionObjs: CollectionType[], progressCb?: ProgressCallback) => Promise<number>
): Promise<void> {
  const timeNow = +new Date();
  const loader = ora(`Building ${indexName} index... ETA: calculating...`).start();
  indexBuildInfoMap[indexName].indexedCount = 0;
  indexBuildInfoMap[indexName].totalToIndexCount = -1;
  indexBuildInfoMap[indexName].eta = -1;
  indexBuildInfoMap[indexName].status = IndexBuildStatus.Indexing;

  const allCollectionItems = await getAllCollectionItems();
  indexBuildInfoMap[indexName].totalToIndexCount = allCollectionItems.length;

  const indexedCount = await indexer(allCollectionItems, ({ indexedCount, totalToIndexCount }) => {
    const percent = (indexedCount / totalToIndexCount) * 100;
    const secondsElapsed = (Date.now() - timeNow) / 1000;

    const etaS = percent === 0 ? -1 : (secondsElapsed * (100 - percent)) / percent;

    indexBuildInfoMap[indexName].indexedCount = indexedCount;
    indexBuildInfoMap[indexName].totalToIndexCount = totalToIndexCount;
    indexBuildInfoMap[indexName].eta = etaS;

    const eta = etaS < 0 ? "calculating..." : etaS.toFixed(0);
    loader.text = `Building ${indexName} index... Elapsed: ${secondsElapsed.toFixed(
      0
    )}s ETA: ${eta}s`;
  });

  indexBuildInfoMap[indexName].eta = 0;
  indexBuildInfoMap[indexName].status = IndexBuildStatus.Ready;

  loader.succeed(`Index build of ${indexName} done in ${(Date.now() - timeNow) / 1000}s.`);
  logger.debug(`Index ${indexName} size: ${indexedCount} items`);
}
