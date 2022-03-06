import Vue from 'vue'
import VueRouter from 'vue-router'
import ArticuloCreacion from './components/ArticuloCreacion'
import ArticuloPanel from './components/ArticuloPanel'
import ArticuloModificacion from './components/ArticuloModificacion'
import AdministradorLogin from './components/AdministradorLogin'
import AdministradorPanel from './components/AdministradorPanel'

import App from './App'

Vue.use(VueRouter)

export default new VueRouter({
    routes: [
        {
            path: '/',                      // 这个 是 主页 的 地址, 绑定了 这个 地址 的 组件 将 首先 被显示 
            name: 'Bienvenido',             // 该 页面 名称 
            component: App,                 // 组件 的 名称
            redirect: '/administradorLogin'      // 从 root 页面 重新 指向 到 articulo_panel 页面 
        }, {
            path: '/administradorPanel',
            name: 'administradorPanel',
            component: AdministradorPanel
        },
        {
            path: '/administradorLogin',
            name: 'administradorLogin',
            component: AdministradorLogin

        },
        {
            path: '/articulo_panel',
            name: 'Panel de articulos',
            component: ArticuloPanel
        },
        {
            path: '/articulo_creacion',
            component: ArticuloCreacion,
            name: 'Creacion de articulo'
        },
        {
            path: '/articulo_modificacion/:id',
            component: ArticuloModificacion,
            name: 'Modificacion de articulo'
        }
    ]
})