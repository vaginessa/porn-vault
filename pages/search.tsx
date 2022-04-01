import axios from "axios";
import { GetServerSideProps } from "next";
import ActorCard from "../components/ActorCard";
import { actorCardFragment } from "../fragments/actor";
import { movieCardFragment } from "../fragments/movie";
import { sceneCardFragment } from "../fragments/scene";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { IPaginationResult } from "../types/pagination";
import { IActor } from "../types/actor";
import { IMovie } from "../types/movie";
import { IScene } from "../types/scene";
import ListContainer from "../components/ListContainer";
import MovieCard from "../components/MovieCard";

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
              ...ActorCard
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

        ${actorCardFragment}
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
    <div style={{ padding: 10 }}>
      {/* Actors */}
      <div style={{ marginBottom: 20 }}>
        <Typography sx={{ marginBottom: "10px" }} variant="h6">
          {t("foundActors", { numItems: actorResult.numItems })}
        </Typography>
        <ListContainer>
          {actorResult.items.map((actor) => (
            <ActorCard actor={actor} key={actor._id} />
          ))}
        </ListContainer>
      </div>
      {/* Movies */}
      <div style={{ marginBottom: 20 }}>
        <Typography sx={{ marginBottom: "10px" }} variant="h6">
          {t("foundMovies", { numItems: movieResult.numItems })}
        </Typography>
        <ListContainer>
          {movieResult.items.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </ListContainer>
      </div>
      {/* Scenes */}
      <div>
        <Typography sx={{ marginBottom: "10px" }} variant="h6">
          {t("foundScenes", { numItems: sceneResult.numItems })}
        </Typography>
        <ListContainer>
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
        </ListContainer>
      </div>
    </div>
  );
}
