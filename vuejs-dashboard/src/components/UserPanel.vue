<template >
  <el-container direction="vertical">
    <el-row>
      <el-button
        type="success"
        round
        @click="abrirUserCreacion(); crearUserVisible=true"
      >创建一个新的 User</el-button>
    </el-row>

    <el-table
      v-bind:data="users"
      cell-dblclick="mirarUser(scope.$index)"
      style="margin-bottom:200px;"
    >
      <el-table-column prop="displayName" label="name" width="140"></el-table-column>
      <el-table-column prop="local.email" label="email" width="140"></el-table-column>
      <el-table-column prop="roles" label="role" width="140">
        <template slot-scope="scope">
          <el-tag v-for="roleName in scope.row.roles" :key="roleName" :type="roleName">{{roleName}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="creada" label="creada" width="140"></el-table-column>
      <el-table-column prop="actualizada" label="actualizada"></el-table-column>
      <el-table-column fixed="right" label="操作" width="150">
        <template slot-scope="scope">
          <el-button @click="mirarUser(scope.$index)" type="text" size="small">查看</el-button>
          <el-button
            @click="abrirUserModificacion(scope.$index); dialogFormVisible = true"
            type="text"
            size="small"
          >编辑</el-button>
          <el-button @click="deleteUser(scope.$index)" type="text" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="查看 user 信息" :visible.sync="mirarUserVisible" width="65%">
      <el-form :model="userForm">
        <el-form-item label="昵称" :label-width="formLabelWidth">{{userForm.displayName}}</el-form-item>
        <el-form-item label="Email" :label-width="formLabelWidth">{{userForm.local.email}}</el-form-item>

        <el-form-item label="Password" :label-width="formLabelWidth">{{userForm.local.password}}</el-form-item>

        <el-form-item label="拥有的角色们" :label-width="formLabelWidth">
          <el-tag v-for="roleName in userForm.roles" :key="roleName" :type="roleName">{{roleName}}</el-tag>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog title="创建 一个 新的 role " :visible.sync="crearUserVisible" width="65%">
      <el-form :model="userNuevo">
        <el-form-item label="昵称" :label-width="formLabelWidth">
          <el-input v-model="userNuevo.displayName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Email" :label-width="formLabelWidth">
          <el-input v-model="userNuevo.local.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="输入密码" :label-width="formLabelWidth">
          <el-input v-model="userNuevo.local.password1" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="请重复输入密码" :label-width="formLabelWidth">
          <el-input v-model="userNuevo.local.password2" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="拥有的角色们" :label-width="formLabelWidth">
          <el-tag v-for="roleName in userNuevo.roles" :key="roleName" :type="roleName">{{roleName}}</el-tag>
        </el-form-item>

        <el-form-item label="角色" :label-width="formLabelWidth">
          <el-select v-model="userNuevo.roles" multiple placeholder="添加或删除">
            <el-option
              v-for="role in rolesExistentesFromDB"
              :key="role.roleName"
              :label="role.roleName"
              :value="role.roleName"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="crearUserVisible = false">取 消</el-button>
        <el-button type="primary" @click="crearUser(); ">确 定 创 建</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改 user 信息" :visible.sync="dialogFormVisible" width="65%">
      <el-form :model="userForm">
        <el-form-item label="昵称" :label-width="formLabelWidth">
          <el-input v-model="userForm.displayName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Email" :label-width="formLabelWidth">
          <el-input v-model="userForm.local.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Password" :label-width="formLabelWidth">
          <el-input v-model="userForm.local.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="拥有的角色们" :label-width="formLabelWidth">
          <el-tag v-for="roleName in userForm.roles" :key="roleName" :type="roleName">{{roleName}}</el-tag>
        </el-form-item>

        <el-form-item label="角色" :label-width="formLabelWidth">
          <el-select v-model="userForm.roles" multiple placeholder="添加或删除">
            <el-option
              v-for="role in rolesExistentesFromDB"
              :key="role.roleName"
              :label="role.roleName"
              :value="role.roleName"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="modificarUser(); ">确 定 修 改</el-button>
      </div>
    </el-dialog>

    <el-button-group style="position:fixed; bottom: 20px; left: 50%;">
      <el-button
        type="primary"
        icon="el-icon-arrow-left"
        :disabled="result.hasPrevPage==false"
        v-on:click="getUsersByPage(result.prevPage)"
      >上一页</el-button>
      <el-button>{{result.page}}</el-button>

      <el-button
        type="primary"
        :disabled="result.hasNextPage==false"
        v-on:click="getUsersByPage(result.nextPage)"
      >
        下一页
        <i class="el-icon-arrow-right el-icon--right"></i>
      </el-button>
    </el-button-group>
  </el-container>
</template>

<script>
import UserModificacion from "./UserModificacion";

export default {
  name: "UserPanel",
  components: {
    UserModificacion
  },
  data: function() {
    return {
      users: [],
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
      userConNuevoDato: null,
      dialogFormVisible: false,
      mirarUserVisible: false,

      // 用于 修改 user 的 json 数据
      indexOfUserAMofidicar: null,
      formLabelWidth: "120px",
      userForm: {
        _id: null,
        displayName: "未设定",
        local: {
          email: "",
          password: "",
          salt: ""
        },
        roles: []
      },
      rolesExistentesFromDB: [],

      // 用于 创建 一个 新的 role
      crearUserVisible: false,
      userNuevo: {
        displayName: "",
        local: {
          email: "",
          password1: "",
          password2: "",
          salt: ""
        },
        roles: []
      }
    };
  },
  methods: {
    crearUser: async function() {
      var response = await this.axios.post("http://127.0.0.1:3000/user/", {
        email: this.userNuevo.local.email,
        password1: this.userNuevo.local.password1,
        password2: this.userNuevo.local.password2,
        roles: this.userNuevo.roles,
        displayName: this.userNuevo.displayName
      });

      if (response.data != null && response.data.code == 0) {
        alert("Creacion correcta" + response.data);
        this.getRolesByPage(1);
        this.crearUserVisible = false;
      } else if (response.data != null) {
        alert(response.data.msg);
      }
    },
    abrirUserCreacion: async function() {
      this.userNuevo = {
        displayName: "",
        local: {
          email: "",
          password: "",
          salt: ""
        },
        roles: []
      };

      var rolesData = await this.axios.get("http://127.0.0.1:3000/role/all");
      this.rolesExistentesFromDB = rolesData.data.data;
    },
    mirarUser: async function(index) {
      var userLocal = this.users[index];
      this.indexOfUserAMofidicar = index;

      var userFromDBData = await this.axios.get(
        "http://127.0.0.1:3000/user/" + userLocal._id
      );

      this.userForm = userFromDBData.data.data;

      this.mirarUserVisible = true;
    },
    deleteUser: async function(index) {
      this.$confirm("此操作将永久删除该user, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          var userLocal = this.users[index];

          var deleteData = await this.axios.delete(
            "http://127.0.0.1:3000/user",
            {
              data: {
                id: userLocal._id
              }
            }
          );
          if (deleteData.data.code == 0) {
            this.$message({
              type: "success",
              message: "删除成功!"
            });
            this.users.splice(index, 1);
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
    abrirUserModificacion: async function(index) {
      var userLocal = this.users[index];
      this.indexOfUserAMofidicar = index;

      var userFromDBData = await this.axios.get(
        "http://127.0.0.1:3000/user/" + userLocal._id
      );
      var rolesData = await this.axios.get("http://127.0.0.1:3000/role/all");
      this.rolesExistentesFromDB = rolesData.data.data;
      this.userForm = userFromDBData.data.data;
    },
    modificarUser: async function() {
      var response = await this.axios.put("http://127.0.0.1:3000/user", {
        userNuevo: this.userForm
      });
      if (response.data.code == 0) {
        this.$message(response.data.msg);

        // 删除 之前的
        this.users.splice(this.indexOfUserAMofidicar, 1);
        // 在原地 插入 修改的
        this.users.splice(this.indexOfUserAMofidicar, 0, response.data.data);
        //注意 只能使用方法来修改， 否则 array - GUI Table 不更新， 如果使用users[i]=user
      } else {
        alert(response.data.msg);
      }
      return;
    },
    getUsersByPage: async function(page) {
      if (isNaN(page) == true) {
        // page 不是一个数字
        alert("页面必须是一个数字");
      }
      var resultado = await this.axios.get(
        "http://127.0.0.1:3000/user/page/" + page
      );
      if (resultado.data.code == 0) {
        this.users = resultado.data.data.docs;
        //console.log(resultado.data.data);
        this.result = resultado.data.data; // page information
        //console.log(this.result);
        return;
      }
      return;
    }
  },
  mounted: async function() {
    this.getUsersByPage(1);
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
