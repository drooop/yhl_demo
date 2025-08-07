import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useSessionStore } from '@/stores/session';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "root" */ '../views/Root.vue'),
    meta: { title: 'Home' },
  },
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
    meta: { title: 'Login' },
  },
  {
    path: '/workspace/:workspace',
    component: () => import(/* webpackChunkName: "workspace" */ '../views/Workspace.vue'),
    meta: { title: 'Workspace' },
  },
  {
    path: '/workspace/:workspace/pic/:pic',
    component: () => import(/* webpackChunkName: "pic" */ '../views/Pic.vue'),
    meta: { title: 'Picture' },
  },
  {
    path: '/workspace/:workspace/pic/:pic/worker/:worker',
    component: () => import(/* webpackChunkName: "worker" */ '../views/Worker.vue'),
    meta: { title: 'Worker' },
  },
  {
    path: '/workspace/:workspace/pic/:pic/worker/:worker/model/:model',
    component: () => import(/* webpackChunkName: "model" */ '../views/Model.vue'),
    meta: { title: 'Model' },
  },
  {
    path: '/settings',
    component: () => import(/* webpackChunkName: "settings" */ '../views/Settings.vue'),
    meta: { title: 'Settings' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const session = useSessionStore();
  if (to.path !== '/login' && !session.isLogin) {
    return '/login';
  }
  if (to.path === '/login' && session.isLogin) {
    return '/';
  }
  return true;
});

router.afterEach((to) => {
  const lang = document.cookie.match(/lang=(\w+)/)?.[1];
  const titles: Record<string, string> = {
    en: 'Matrix Chat',
    zh: '矩阵聊天',
  };
  document.title = titles[lang || ''] || (to.meta.title as string) || 'Matrix Chat';
  console.log('navigated to', to.fullPath);
});

export default router;
