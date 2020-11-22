import ora from "ora";

import argv from "../../args";
import * as logger from "../../utils/logger";
import { Gianna } from ".";

const DEFAULT_INDEX_SLICE_SIZE = 5000;

export type ProgressCallback = (progressCb: { percent: number }) => void;

export async function addSearchDocs<IndexItemType extends { _id: string }>(
  index: Gianna.Index<IndexItemType>,
  docs: IndexItemType[]
): Promise<void> {
  logger.log(`Indexing ${docs.length} items...`);
  const timeNow = +new Date();
  const res = await index.index(docs);
  logger.log(`Gianna indexing done in ${(Date.now() - timeNow) / 1000}s`);
  return res;
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
      progressCb({ percent: (indexedItemCount / items.length) * 100 });
    }
  }

  for (const item of items) {
    docsToIndex.push(await createSearchDoc(item));

    if (docsToIndex.length === (argv["index-slice-size"] || DEFAULT_INDEX_SLICE_SIZE)) {
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

  const indexedCount = await indexer(await getAllCollectionItems(), ({ percent }) => {
    const secondsElapsed = (Date.now() - timeNow) / 1000;
    const eta =
      percent === 0 ? "calculating..." : ((secondsElapsed * (100 - percent)) / percent).toFixed(0);
    loader.text = `Building ${indexName} index... Elapsed: ${secondsElapsed.toFixed(
      0
    )}s ETA: ${eta}s`;
  });

  loader.succeed(`Index build of ${indexName} done in ${(Date.now() - timeNow) / 1000}s.`);
  logger.log(`Index ${indexName} size: ${indexedCount} items`);
}
