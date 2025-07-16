import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";

// router.beforeEach((to, _from, next) => {
//   if (to.path.startsWith("/chat") && !localStorage.getItem("accessToken")) {
//     next("/login");
//   } else next();
// });

export default createRouter({
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", component: Login },
    { path: "/chat", component: Home },
  ],
});
