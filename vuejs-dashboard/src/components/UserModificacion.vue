<template >
  <el-dialog title="收货地址" :visible.sync="visible">
    <el-form :model="form">
      <el-form-item label="活动名称" :label-width="formLabelWidth">
        <el-input v-model="form.name" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="活动区域" :label-width="formLabelWidth">
        <el-select v-model="form.region" placeholder="请选择活动区域">
          <el-option label="区域一" value="shanghai"></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click=" visible = false">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
      visibleFromParent:Boolean
  },
  data: function() {
    return {
      userConNuevoDato: null,
      form: {
        name: "",
        region: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: ""
      },
      formLabelWidth: "120px",
      visible: this.visibleFromParent
    };
  },

  methods: {
    modificarUser: async function(index) {},
    getUser: async function(id) {
      var resultado = await this.axios.get(
        "http://127.0.0.1:3000/user/page/" + page
      );
      if (resultado.data.code == 0) {
        this.user = resultado.data.data.docs;
        //console.log(resultado.data.data);
        return;
      }
      return;
    }
  },
  /*   computed: {
    visible: function() {
      return this.visibleFromParent;
    }
  }, */
  mounted: function() {
    //this.getUser(this.id);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>
