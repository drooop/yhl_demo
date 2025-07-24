import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Root from "../views/Root.vue";
import Workspace from "../views/Workspace.vue";
import Pic from "../views/Pic.vue";
import Worker from "../views/Worker.vue";
import Model from "../views/Model.vue";
import Settings from "../views/Settings.vue";

// router.beforeEach((to, _from, next) => {
//   if (to.path.startsWith("/chat") && !localStorage.getItem("accessToken")) {
//     next("/login");
//   } else next();
// });

export default createRouter({
  history: createWebHistory(),
  // history: createWebHashHistory(),
  routes: [
    { path: "/", component: Root },
    { path: "/login", component: Login },
    { path: "/workspace/:workspace", component: Workspace },
    { path: "/workspace/:workspace/pic/:pic", component: Pic },
    { path: "/workspace/:workspace/pic/:pic/worker/:worker", component: Worker },
    {
      path: "/workspace/:workspace/pic/:pic/worker/:worker/model/:model",
      component: Model,
    },
    { path: "/settings", component: Settings },
  ],
});
