<template >
  <el-container style="height: 100%;">
    <el-contaier>
      <el-aside
        width="200px"
        style=" height: 100vh;   background-color: rgb(238, 241, 246) ; border-right: solid 1px #e6e6e6 !important;"
      >
        <el-menu default-active="1" style=" border-right:  none !important;" @select="handleSelect">
          <el-menu-item index="1">User Panel</el-menu-item>
          <el-menu-item index="2">Roles And APIs</el-menu-item>
        </el-menu>
      </el-aside>
    </el-contaier>

    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <el-dropdown @command="handleCommand">
          <i class="el-icon-setting" style="margin-right: 15px"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>查看</el-dropdown-item>
            <el-dropdown-item>新增</el-dropdown-item>
            <el-dropdown-item>删除</el-dropdown-item>
            <el-dropdown-item command="logout">登出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <span>{{userName}}</span>
      </el-header>

      <el-main>
        <component v-bind:is="currentComponent"></component>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
//import axios from "axios";

import UserPanel from "./UserPanel.vue";
import RoleAPIsPanel from "./RoleAPIsPanel.vue";
import ArticuloPanel from "./ArticuloPanel.vue";

export default {
  name: "AdministradorPanel",
  components: {
    ArticuloPanel,
    UserPanel,
    RoleAPIsPanel
  },
  data: function() {
    return {
      userName: "无名",
      curComponent: "UserPanel"
    };
  },
  methods: {
    handleCommand(command) {
      //this.$message("click on item " + command);
      if (command == "logout") {
        this.logout();
      }
    },
    logout: async function() {
      var resultado = await this.axios.get("http://127.0.0.1:3000/user/logout");
      if (resultado.data.code == 0) {
        alert(this.userName + "， " + resultado.data.msg);
        this.$router.push("/administradorLogin");
        return;
      } else {
        alert(resultado.data.msg);
        return;
      }
      return;
    },
    handleSelect: function(key, keyPath) {
      if (key == 1) {
        this.curComponent = "UserPanel";
        //console.log(key, keyPath);
      } else if (key == 2) {
        this.curComponent = "RoleAPIsPanel";
        //console.log(key, keyPath);
      }
      this.init();
    },
    init: async function() {
      var resultado = await this.axios.get(
        "http://127.0.0.1:3000/rbac/logueado"
      );
      if (resultado.data.code == 0) {
        this.$router.push({ path: "administradorPanel" }); //成功登陆
        var r = await this.axios.get("http://127.0.0.1:3000/user/basicInfo");
        if (resultado.data.code == 0) {
          //console.log(r.data);
          this.userName = r.data.data;
        }
      } else {
        this.$router.push({ path: "administradorLogin" }); //未登陆
        this.$message(resultado.data.msg);
      }
      
    }
  },
  mounted: async function() {
    this.init();
  },
  computed: {
    currentComponent: function() {
      return this.curComponent;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}
</style>
