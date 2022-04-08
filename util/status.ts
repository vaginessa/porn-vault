import Axios, { AxiosResponse } from "axios";

export enum CollectionBuildStatus {
  None = "none",
  Loading = "loading",
  Ready = "ready",
}

export enum ServiceStatus {
  Unknown = "unknown",
  Disconnected = "disconnected",
  Stopped = "stopped",
  Connected = "connected",
}

export interface CollectionBuildInfo {
  name: string;
  status: CollectionBuildStatus;
}

export enum IndexBuildStatus {
  None = "none",
  Created = "created",
  Indexing = "indexing",
  Ready = "ready",
}

export interface IndexBuildInfo {
  name: string;
  indexedCount: number;
  totalToIndexCount: number;
  eta: number;
  status: IndexBuildStatus;
}

export interface StatusData {
  izzy: {
    status: ServiceStatus;
    version: string;
    collections: { name: string; count: number; size: number }[];
    collectionBuildInfoMap: {
      [indexName: string]: CollectionBuildInfo;
    };
    allCollectionsBuilt: boolean;
  };
  // ES
  elasticsearch: {
    status: ServiceStatus;
    version: string;
    indices: {
      health: string;
      status: string;
      index: string;
      uuid: string;
      pri: string;
      rep: string;
      "docs.count": string;
      "docs.deleted": string;
      "store.size": string;
      "pri.store.size": string;
    }[];
    indexBuildInfoMap: {
      [indexName: string]: IndexBuildInfo;
    };
    allIndexesBuilt: boolean;
  };
  // Other
  serverUptime: number;
  osUptime: number;
  serverReady: boolean;
}

export interface StatusSimple {
  serverReady: boolean;
  setupMessage: string;
}

export function getSimpleStatus(): Promise<AxiosResponse<StatusSimple>> {
  return Axios.get<StatusSimple>("/api/system/status/simple", {
    params: { password: localStorage.getItem("password") },
  });
}

export function getFullStatus(): Promise<AxiosResponse<StatusData>> {
  return Axios.get<StatusData>("/api/system/status/full", {
    params: { password: localStorage.getItem("password") },
  });
}
