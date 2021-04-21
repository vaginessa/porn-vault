import ActorDetailsBar from "@/components/AppBar/ActorDetails.vue";
import MovieDetailsBar from "@/components/AppBar/MovieDetails.vue";
import SceneDetailsBar from "@/components/AppBar/SceneDetails.vue";
import StudioDetailsBar from "@/components/AppBar/StudioDetails.vue";
import About from "@/views/About.vue";
import ActorDetails from "@/views/ActorDetails.vue";
import Actors from "@/views/Actors.vue";
import Home from "@/views/Home.vue";
import Images from "@/views/Images.vue";
import Labels from "@/views/Labels.vue";
import Markers from "@/views/Markers.vue";
import MovieDetails from "@/views/MovieDetails.vue";
import Movies from "@/views/Movies.vue";
import Plugins from "@/views/Plugins.vue";
import SceneDetails from "@/views/SceneDetails.vue";
import Scenes from "@/views/Scenes.vue";
import StudioDetails from "@/views/StudioDetails.vue";
import Studios from "@/views/Studios.vue";
import Views from "@/views/Views.vue";
import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/history",
    name: "view-history",
    component: Views,
  },
  {
    path: "/views",
    redirect: "/history",
  },
  /*  {
    path: "/logs",
    name: "logs",
    component: Logs,
  }, */
  {
    path: "/plugins",
    name: "plugins",
    component: Plugins,
  },
  {
    path: "/about",
    name: "about",
    component: About,
  },
  {
    path: "/settings",
    name: "settings",
    component: About,
  },
  {
    path: "/scenes",
    name: "scenes",
    component: Scenes,
  },
  {
    path: "/actors",
    name: "actors",
    component: Actors,
  },
  {
    path: "/movies",
    name: "movies",
    component: Movies,
  },
  {
    path: "/studios",
    name: "studios",
    component: Studios,
  },
  {
    path: "/scene/:id",
    name: "scene-details",
    component: SceneDetails,
    meta: {
      detailsBarComponent: SceneDetailsBar,
    },
  },
  {
    path: "/actor/:id",
    name: "actor-details",
    component: ActorDetails,
    meta: {
      detailsBarComponent: ActorDetailsBar,
    },
  },
  {
    path: "/movie/:id",
    name: "movie-details",
    component: MovieDetails,
    meta: {
      detailsBarComponent: MovieDetailsBar,
    },
  },
  {
    path: "/studio/:id",
    name: "studio-details",
    component: StudioDetails,
    meta: {
      detailsBarComponent: StudioDetailsBar,
    },
  },
  {
    path: "/labels",
    name: "labels",
    component: Labels,
  },
  {
    path: "/markers",
    name: "markers",
    component: Markers,
  },
  {
    path: "/images",
    name: "images",
    component: Images,
  },
  {
    path: "*",
    redirect: "/",
  },
];

const router = new VueRouter({
  routes,
});

export default router;
