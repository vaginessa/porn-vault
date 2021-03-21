import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Settings from "../views/Settings/Settings.vue";
import UISettings from "../views/Settings/UI.vue";
import MetadataSettings from "../views/Settings/Metadata.vue";
import Scenes from "../views/Scenes.vue";
import Actors from "../views/Actors.vue";
import Movies from "../views/Movies.vue";
import SceneDetails from "../views/SceneDetails.vue";
import ActorDetails from "../views/ActorDetails.vue";
import MovieDetails from "../views/MovieDetails.vue";
import StudioDetails from "../views/StudioDetails.vue";
import Labels from "../views/Labels.vue";
import Images from "../views/Images.vue";
import Studios from "../views/Studios.vue";
import Plugins from "../views/Plugins.vue";
/* import Logs from "../views/Logs.vue"; */
import Views from "../views/Views.vue";
import Markers from "../views/Markers.vue";

Vue.use(VueRouter);

export const routes = [
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
    component: Settings,
  },
  {
    path: "/settings",
    name: "settings",
    component: Settings,
    meta: {
      title: "Settings"
    }
  },
  {
    path: "/settings/ui",
    name: "settings-ui",
    component: UISettings,
    meta: {
      title: "UI",
      description: "Display and appearance options"
    }
  },
  {
    path: "/settings/metadata",
    name: "settings-metadata",
    component: MetadataSettings,
    meta: {
      title: "Metadata",
      description: "Manage custom fields"
    }
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
  },
  {
    path: "/actor/:id",
    name: "actor-details",
    component: ActorDetails,
  },
  {
    path: "/movie/:id",
    name: "movie-details",
    component: MovieDetails,
  },
  {
    path: "/studio/:id",
    name: "studio-details",
    component: StudioDetails,
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
