<template>
  <div class="ArticuloModificacion">
      <div class="articuloModificacion">
        <h1> Modificacion de articulo </h1>
        <div class="listaArtiuclos">
            <div class="articulo">
                <h4 class="name"> Nombre: <input v-model="articulo.nombre">  </h4>
                <h6 class="fecha">Fecha Creada: {{articulo.creada}} </h6>
                <h6 class="fecha">Fecha Actualizada: {{articulo.actualizada}} </h6>
                <div class="LDs" v-for="ld in articulo.LDs" v-bind:key="ld._id"> 
                      <h6>  
                            <input v-model="ld.labelName"> :
                            <button v-on:click="eliminarLD(ld)" style="float:right;">Eliminar</button>  

                            <br>
                            <br>
                            <textarea class="area" v-on:keydown="auto_grow($event.target)"  v-model="ld.labelDescription">  </textarea>  
                      </h6> 
                </div>
                <div class="botonAnadirLD">
                      <button v-on:click="anadirLD()">Añadir Nuevo LD</button>  
                </div> 
                <div style="clear:both;"></div>
            </div>
            <div class="botonConfirmacion" >
                <button v-on:click="$router.go(-1)">Cancelar</button>
                <button v-on:click="modificar(articulo)">Modificar</button>
            </div>
        </div>
      </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ArticuloModificacion",
  props: {
    id: String
  },
  data: function() {
    return {
      articulo: {
        nombre: "",
        LDs: []
      }
    };
  },
  methods: {
    obtenerArticulo: function(id) {
      return axios.get("http://127.0.0.1:3000/articulo/" + id);
    },
    anadirLD: function() {
      this.articulo.LDs.push({
        labelName: "New Label",
        labelDescription: "Your Content"
      });
    },
    eliminarLD: function(ld) {
      var index = this.articulo.LDs.indexOf(ld);
      this.articulo.LDs.splice(index, 1);
    },
    modificar: function(articuloModificado) {
      return axios
        .put("http://127.0.0.1:3000/articulo/", { articulo: articuloModificado })
        .then(response => {
          if (response.data != null && response.data.code == 0) {
            alert("Modificacion correcta");
            this.$router.go(-1);
          } else if (response.data != null) {
            alert(response.data.msg + " codigo de error:" + response.data.code);
          }
        });
    },
    auto_grow: function(el) {
      setTimeout(function() {
        el.style.cssText = "resize: none; width:99%; height:auto;";
        // for box-sizing other than "content-box" use:
        // el.style.cssText = '-moz-box-sizing:content-box';
        el.style.cssText =
          "resize: none; width:99%; height:" + el.scrollHeight + "px";
      }, 0);
    }
  },
  mounted: function() {
    this.obtenerArticulo(this.$route.params.id).then(response => {
      if (response.data != null && response.data.code == 0) {
        this.articulo = response.data.doc;
      } else if (response.data != null) {
        alert(response.data.msg + " codigo de error:" + response.data.code);
      }

      setTimeout(function() {
        var array = document.getElementsByClassName("area");
        console.log(array);
        var i = 0;
        for (; i < array.length; i++) {
          array[i].style.cssText =
            "resize: none; width:99%; height:" + array[i].scrollHeight + "px";
        }
      }, 1);
    });
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
.botonAnadirLD {
  float: right;
  margin-top: 5px;
}
.area {
  resize: none;
  width: 99%;
  height: auto;
}
.botonConfirmacion{
  margin-bottom: 100px;
}
</style>
