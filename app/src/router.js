import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

import Videos from "./views/Videos";

export default new Router({
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/videos',
      component: Videos
    }
  ]
})
