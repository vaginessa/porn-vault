<template>
  <div>
    {{ scene }}
  </div>
</template>

<script>
import axios from "axios";

async function fetchScene(id) {
  const { data } = await axios.post(
    "http://localhost:3000/api/ql",
    {
      query: `
        query($id: String!) {
          getSceneById(id: $id) {
            _id
            name
            releaseDate
            rating
            thumbnail {
              _id
              color
            }
            labels {
              _id
              name
              color
            }
            actors {
              _id
              name
            }
            studio {
              name
            }
          }
        }
      `,
      variables: {
        id,
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );

  return data.data.getSceneById;
}

export default {
  components: {},
  async asyncData({ params, error }) {
    try {
      const scene = await fetchScene(params.id);

      if (!scene) {
        return error({
          statusCode: 404,
          message: "Scene not found",
        });
      }

      return { scene };
    } catch (fetchError) {
      if (!fetchError.response) {
        error({
          statusCode: 500,
          message: "No response",
        });
      } else {
        error({
          statusCode: fetchError.response.status,
          message: fetchError.response.data,
        });
      }
    }
  },
};
</script>

<style scoped></style>
