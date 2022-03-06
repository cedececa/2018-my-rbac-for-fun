<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <router-view/>
  </div>
</template>

<script>
export default {
  name: "app",
  mounted: async function() {
    var resultado = await this.axios.get("http://127.0.0.1:3000/rbac/logueado");
    if (resultado.data.code == 0) {
      this.$router.replace("/administradorPanel"); //成功登陆
    } else {
      this.$router.replace("/administradorLogin"); //未登陆
    }
  }
};
</script>

<style>
* {
  padding: 0;
  margin: 0;
}
</style>
