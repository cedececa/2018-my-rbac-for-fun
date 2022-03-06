<template>
  <div class="ArticuloPanel">
      <h1>Bienvenido al panel de articulos</h1>
      <div class="Creacion">
        <button v-on:click="$router.push({path:'/articulo_creacion'})">Crear un nuevo</button>
      </div>
      <div class="listaArtiuclos" style="clear:both;">
          <div class="articulo"  v-for="doc in page.docs" v-bind:key="doc._id">
              <h4 class="name">Nombre: {{doc.nombre}} </h4>
              <h6 class="fecha">Fecha Creada: {{doc.creada}} </h6>
              <h6 class="fecha">Fecha Actualizada: {{doc.actualizada}} </h6>
              <div class="LDs" v-for="ld in doc.LDs" v-bind:key="ld._id"> 
                    <h6 style=""> {{ld.labelName}} : <p class="labelDescription">{{ld.labelDescription}}</p></h6> 
              </div>
              <div class="grupoDeButones">
                  <button v-on:click="modificar(doc)">Modificar</button>
                  <button v-on:click="eliminar(doc)">Eliminar</button>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "ArticuloPanel",
  data() {
    return {
      page: {}
    };
  },
  computed: {},
  methods: {
    obtenerArticulos: function(page) {
      axios.get("http://127.0.0.1:3000/articulo/pagina/" + page).then(response => {
        this.page = response.data;
        return response;
      });
    },
    eliminar: function(doc) {
      axios
        .delete("http://127.0.0.1:3000/articulo/", { data: { id: doc._id } })
        .then(response => {
          console.log(response.data);
          if (response.data != null && response.data.code == 0) {
            alert("Eliminacion correcta");
            var index = this.page.docs.indexOf(doc);
            console.log(index);
            this.page.docs.splice(index, 1);
          }

          return response;
        });
    },
    modificar: function(doc) {
      this.$router.push({ path: "/articulo_modificacion/" + doc._id });
    }
  },
  created: function() {
    this.obtenerArticulos(1);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.ArticuloPanel {
  position: relative;
}
.Creacion {
  float: right;
  margin-left: 20%;
  margin-right: 20%;
  margin-bottom: 20px;
}
.articulo {
  position: relative;
  text-align: left;
  border-style: solid;
  border-width: 3px;
  margin-left: 20%;
  margin-right: 20%;
  margin-bottom: 20px;
  padding-left: 15px;
  padding-right: 15px;
  padding-bottom: 15px;
}
.LDs {
  border-style: solid;
  border-width: 1px;
  margin-top: 10px;
  padding-left: 5px;
  padding-right: 5px;
}
.grupoDeButones {
  position: absolute;
  right: 10px;
  top: 10px;
}
.labelDescription {
  word-wrap: break-word; /* IE 5.5-7 */
  white-space: -moz-pre-wrap; /* Firefox 1.0-2.0 */
  white-space: pre-wrap; /* current browsers */
}
</style>
