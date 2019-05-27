import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Videos from './views/Videos.vue'
import Actors from './views/Actors.vue'
import Settings from './views/Settings.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/videos',
      name: 'videos',
      component: Videos
    },
    {
      path: '/actors',
      name: 'actors',
      component: Actors
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
})
