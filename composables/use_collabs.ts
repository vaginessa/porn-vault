import { useEffect, useState } from "react";

import { IActor } from "../types/actor";
import { fetchCollabs } from "../util/collabs";

export function useCollabs(actorId: string) {
  const [collabs, setCollabs] = useState<IActor[]>([]);
  const [loader, setLoader] = useState(true);

  async function loadCollabs() {
    try {
      setLoader(true);
      const collabs = await fetchCollabs(actorId);
      setCollabs(collabs);
    } catch (error) {}
    setLoader(false);
  }

  useEffect(() => {
    loadCollabs();
  }, []);

  return { loading: loader, collabs };
}
