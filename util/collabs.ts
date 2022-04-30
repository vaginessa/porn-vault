import axios from "axios";
import { IActor } from "../types/actor";

export async function fetchCollabs(actorId: string): Promise<IActor[]> {
  const { data } = await axios.post(
    "/api/ql",
    {
      query: `
    query ($id: String!) {
      getActorById(id: $id) {
        collabs {
          _id
          name
          avatar {
            _id
            color
          }
        }
      }
    }
    `,
      variables: {
        id: actorId,
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );
  return data.data.getActorById.collabs;
}
