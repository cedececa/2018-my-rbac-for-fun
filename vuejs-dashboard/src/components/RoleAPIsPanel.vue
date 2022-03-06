<template >
  <el-container direction="vertical">
    <el-row>
      <el-button
        type="success"
        round
        @click="abrirRoleCreacion(); crearRoleVisible=true"
      >创建一个新的 Role</el-button>
    </el-row>

    <el-table
      v-bind:data="roles"
      cell-dblclick="mirarRole(scope.$index)"
      style="margin-bottom:200px;"
    >
      <el-table-column prop="roleName" label="Role name" width="140"></el-table-column>
      <el-table-column prop="APIsPermitidos" label="APIs Permitidos">
        <template slot-scope="scope">
          <el-tag
            v-for="api in scope.row.APIsPermitidos"
            :key="api.method+api.path"
          >{{api.method}}:{{api.path}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作" width="150">
        <template slot-scope="scope">
          <el-button @click="mirarRole(scope.$index)" type="text" size="small">查看</el-button>
          <el-button
            @click="abrirRoleModificacion(scope.$index); dialogFormVisible = true"
            type="text"
            size="small"
          >编辑</el-button>
          <el-button @click="deleteRole(scope.$index)" type="text" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="查看 Role 信息" :visible.sync="mirarRoleVisible" width="65%">
      <el-form :model="roleForm">
        <el-form-item label="角色名称" :label-width="formLabelWidth">{{roleForm.roleName}}</el-form-item>
        <el-form-item label="拥有的APIs" :label-width="formLabelWidth">
          <el-tag v-for="api in roleForm.APIsPermitidos" :key="api.value">{{api.value}}</el-tag>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog title="创建 一个 新的 role " :visible.sync="crearRoleVisible" width="65%">
      <el-form :model="roleNuevo">
        <el-form-item label="角色名称" :label-width="formLabelWidth">
          <el-input v-model="roleNuevo.roleName" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="拥有的APIs" :label-width="formLabelWidth">
          <el-tag
            v-for="api in roleNuevo.APIsPermitidos"
            :key="api.method+api.path"
          >{{api.method+api.path}}</el-tag>
        </el-form-item>

        <el-form-item label="APIs" :label-width="formLabelWidth">
          <el-select
            v-model="roleNuevo.APIsPermitidos"
            multiple
            placeholder="添加或删除"
            style="width:80%"
          >
            <el-option
              v-for="api in apisFromDB"
              :key="api.method+api.path"
              :label="api.method+api.path"
              :value="api"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="crearRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="crearRole(); ">确 定 创 建</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改 role 信息" :visible.sync="dialogFormVisible" width="65%">
      <el-form :model="roleForm">
        <el-form-item label="角色名称" :label-width="formLabelWidth">
          <el-input v-model="roleForm.roleName" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="拥有的APIs" :label-width="formLabelWidth">
          <el-tag
            v-for="api in roleForm.APIsPermitidos"
            :key="api.method+api.path"
          >{{api.method+api.path}}</el-tag>
        </el-form-item>

        <el-form-item label="APIs" :label-width="formLabelWidth">
          <el-select
            v-model="roleForm.APIsPermitidos"
            multiple
            placeholder="添加或删除"
            style="width:80%"
          >
            <el-option
              v-for="api in apisFromDB"
              :key="api.method+api.path"
              :label="api.method+api.path"
              :value="api"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="modificarRole(); dialogFormVisible = false">确 定 修 改</el-button>
      </div>
    </el-dialog>

    <el-button-group style="position:fixed; bottom: 20px; left: 50%;">
      <el-button
        type="primary"
        icon="el-icon-arrow-left"
        :disabled="result.hasPrevPage==false"
        v-on:click="getrolesByPage(result.prevPage)"
      >上一页</el-button>
      <el-button>{{result.page}}</el-button>

      <el-button
        type="primary"
        :disabled="result.hasNextPage==false"
        v-on:click="getrolesByPage(result.nextPage)"
      >
        下一页
        <i class="el-icon-arrow-right el-icon--right"></i>
      </el-button>
    </el-button-group>
  </el-container>
</template>

<script>
export default {
  components: {},
  data: function() {
    return {
      roles: [],
      result: {
        hasNextPage: false,
        hasPrevPage: false,
        limit: null,
        nextPage: null,
        page: 1,
        prevPage: null,
        totalDocs: null,
        totalPages: null
      },

      dialogFormVisible: false,
      mirarRoleVisible: false,
      crearRoleVisible: false,

      // 用于 修改 role 的 json 数据
      indexOfRoleAMofidicar: null,
      formLabelWidth: "120px",

      roleForm: {
        _id: null,
        roleName: null,
        APIsPermitidos: []
      },
      apisFromDB: [],

      // 用于 创建 一个 新的 role
      roleNuevo: {
        roleName: "",
        APIsPermitidos: []
      }
    };
  },
  methods: {
    crearRole: async function() {
      var response = await this.axios.post("http://127.0.0.1:3000/role/", {
        roleName: this.roleNuevo.roleName,
        APIsPermitidos: this.roleNuevo.APIsPermitidos
      });

      if (response.data != null && response.data.code == 0) {
        alert("Creacion correcta" + response.data);
        this.getRolesByPage(1);
        this.crearRoleVisible = false;
      } else if (response.data != null) {
        alert(response.data.msg);
      }
    },
    abrirRoleCreacion: async function() {
      this.roleNuevo = { roleName: "", APIsPermitidos: [] };

      var apisData = await this.axios.get("http://127.0.0.1:3000/api/all");

      this.apisFromDB = apisData.data.data;
    },
    mirarRole: async function(index) {
      var roleLocal = this.roles[index];
      this.indexOfRoleAMofidicar = index;

      var roleFromDBData = await this.axios.get(
        "http://127.0.0.1:3000/role/" + roleLocal.roleName
      );

      this.roleForm = roleFromDBData.data.data;
      this.mirarRoleVisible = true;
    },
    deleteRole: async function(index) {
      this.$confirm("此操作将永久删除该 role , 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          var roleLocal = this.roles[index];
          var deleteData = await this.axios.delete(
            "http://127.0.0.1:3000/role",
            {
              data: {
                id: roleLocal._id
              }
            }
          );
          if (deleteData.data.code == 0) {
            this.$message({
              type: "success",
              message: "删除成功!"
            });
            this.roles.splice(index, 1);
          } else {
            this.$message({
              type: "info",
              message: deleteData.data.msg
            });
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    abrirRoleModificacion: async function(index) {
      var roleLocal = this.roles[index];
      this.indexOfRoleAMofidicar = index;

      var roleFromDBData = await this.axios.get(
        "http://127.0.0.1:3000/role/" + roleLocal.roleName
      );

      var apisData = await this.axios.get("http://127.0.0.1:3000/api/all");

      this.apisFromDB = apisData.data.data;

      this.roleForm = roleFromDBData.data.data;
    },
    modificarRole: async function() {
      var response = await this.axios.put("http://127.0.0.1:3000/role", {
        roleModificado: this.roleForm
      });
      if (response.data.code == 0) {
        this.$message(response.data.msg);

        // 删除 之前的
        this.roles.splice(this.indexOfRoleAMofidicar, 1);
        // 在原地 插入 修改的
        this.roles.splice(this.indexOfRoleAMofidicar, 0, response.data.data);
        //注意 只能使用方法来修改， 否则 array - GUI Table 不更新， 如果使用roles[i]=role
      } else {
        alert(response.data.msg);
      }
      return;
    },
    getRolesByPage: async function(page) {
      if (isNaN(page) == true) {
        // page 不是一个数字
        alert("页面必须是一个数字");
      }
      var resultado = await this.axios.get(
        "http://127.0.0.1:3000/role/page/" + page
      );
      if (resultado.data.code == 0) {
        this.roles = resultado.data.data.docs;
        //console.log(resultado.data.data);
        this.result = resultado.data.data; // page information
        //console.log(this.result);
        return;
      }
      return;
    }
  },
  mounted: async function() {
    this.getRolesByPage(1);
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
