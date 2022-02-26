import axios from "axios";
import { GetServerSideProps } from "next";
import ActorCard from "../components/ActorGridItem";
import { movieCardFragment } from "../fragments/movie";
import { sceneCardFragment } from "../fragments/scene";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { IPaginationResult } from "../types/pagination";
import { IActor } from "../types/actor";
import { IMovie } from "../types/movie";
import { IScene } from "../types/scene";

function thumbnailUrl(thumbnail: string) {
  return `/api/media/image/${thumbnail}/thumbnail?password=xxx`;
}

async function searchAll(query: string) {
  const { data } = await axios.post(
    "http://localhost:3000/api/ql",
    {
      query: `
        query($sc: SceneSearchQuery!, $ac: ActorSearchQuery!, $mo: MovieSearchQuery!) {
          getScenes(query: $sc) {
            items {
              ...SceneCard
            }
            numItems
          }
          getActors(query: $ac) {
            items {
              _id
              name
              thumbnail {
                _id
                color
              }
            }
            numItems
          }
          getMovies(query: $mo) {
            items {
              ...MovieCard
            }
            numItems
          }
        }

        ${sceneCardFragment}
        ${movieCardFragment}
      `,
      variables: {
        sc: {
          query,
          take: 10,
        },
        ac: {
          query,
          take: 10,
        },
        mo: {
          query,
          take: 10,
        },
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );

  return {
    sceneResult: data.data.getScenes,
    actorResult: data.data.getActors,
    movieResult: data.data.getMovies,
  };
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const result = await searchAll(String(query.q));
  return {
    props: {
      ...result,
    },
  };
};

export default function SearchPage(props: {
  actorResult: IPaginationResult<IActor>;
  movieResult: IPaginationResult<IMovie>;
  sceneResult: IPaginationResult<IScene>;
}) {
  const t = useTranslations();

  const { actorResult, movieResult, sceneResult } = props;

  return (
    <div>
      {/* Actors */}
      <div style={{ marginBottom: 20 }}>
        <Typography sx={{ marginBottom: "10px" }} variant="h6">
          {t("foundActors", { numItems: actorResult.numItems })}
        </Typography>
        <div
          className="list-container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gridGap: 4,
          }}
        >
          {actorResult.items.map((actor) => (
            <ActorCard
              key={actor._id}
              favorite={actor.favorite}
              name={actor.name}
              thumbnail={actor.thumbnail?._id}
            ></ActorCard>
          ))}
        </div>
      </div>
      {/* Movies */}
      <div style={{ marginBottom: 20 }}>
        <Typography sx={{ marginBottom: "10px" }} variant="h6">
          {t("foundMovies", { numItems: movieResult.numItems })}
        </Typography>
        <div
          className="list-container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gridGap: 4,
          }}
        >
          {movieResult.items.map((movie) => (
            <div key={movie._id}>
              <img
                style={{ borderRadius: 8, objectFit: "cover" }}
                width="100%"
                height="100%"
                src={thumbnailUrl(movie.frontCover?._id || "null")}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Scenes */}
      <div>
        <Typography sx={{ marginBottom: "10px" }} variant="h6">
          {t("foundScenes", { numItems: sceneResult.numItems })}
        </Typography>
        <div
          className="list-container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gridGap: 4,
          }}
        >
          {sceneResult.items.map((scene) => (
            <div key={scene._id}>
              <img
                style={{ borderRadius: 8, objectFit: "cover" }}
                width="100%"
                height="100%"
                src={thumbnailUrl(scene.thumbnail?._id || "null")}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
