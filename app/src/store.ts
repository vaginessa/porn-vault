import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import GlobalsModule from "@/store_modules/globals";
import VideoModule from "@/store_modules/videos";
import ActorModule from "@/store_modules/actors";
import ImageModule from "@/store_modules/images";

export default new Vuex.Store({
  modules: {
    globals: GlobalsModule,
    videos: VideoModule,
    actors: ActorModule,
    images: ImageModule
  }
})
