import { createRouter, createWebHashHistory } from 'vue-router'
import SelectView from '../views/SelectView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'select_list',
      component: SelectView,
    },
    {
      path: '/friends',
      name: 'friends',
      component: () => import('../views/FriendsView.vue'),
      beforeEnter: (to, from, next) => {
        if (from.name === undefined)
        {
          next({name: 'select_list'})
        }
        else next()
      }
    },
    {
      path: '/wall/:id',
      name: 'wall',
      component: () => import('../views/WallView.vue'),
      beforeEnter: (to, from, next) => {
        if (from.name === undefined)
        {
          next({name: 'select_list'})
        }
        else next()
      }
    }
  ]
})

export default router
