<template>
  <div class="app-container">
    <div class="content">
      <!-- 页首 -->
      <el-page-header @back="goBack">
        <span slot="title" style="font-size:12.5px">
          返回
        </span>
        <span slot="content" style="font-size:12.5px">
          {{ title }}
        </span>
      </el-page-header>
      <!-- 项目概要 -->
      <div class="info">
        <div>
          <div>迭代次数</div>
          <div class="value">{{ cnt }}</div>
        </div>

        <div>
          <div>连续按时交付数</div>
          <div class="value">{{ success }}</div>
        </div>

        <div>
          <div>bug数</div>
          <div class="value">--</div>
        </div>
      </div>

      <div class="iterate">
        <!-- 操作按钮 -->
        <div style="margin-bottom:40px;">
          <el-radio-group v-model="radio" style="float:right; margin:0 20px" size="mini">
            <el-radio-button label="迭代"></el-radio-button>
            <el-radio-button label="bug"></el-radio-button>
          </el-radio-group>
          <el-button v-if="radio == 'bug'" style="float:right" @click="bugDialog = true" type="primary" icon="el-icon-plus">报告bug</el-button>
          <el-button v-if="permission && radio == '迭代'" style="float:right" @click="newIteration" type="primary" icon="el-icon-plus">新建迭代</el-button>
        </div>
        <!-- 迭代表格 -->
        <div v-if="radio == '迭代'">
          <el-table key="iteration" :show-header="false" :data="ilist" style="border-top: 0.5px solid #f0f0f0">
            <el-table-column width="200">
              <template slot-scope="scope">
                <div style="height:80px;display:flex; justify-content: center; flex-direction:column;">
                  <div>
                    <el-tag>第{{ scope.row.cnt }}次迭代</el-tag>
                    <span style="margin-left:16px">预期AC: {{ scope.row.expectedAC }}</span>
                  </div>
                  <div>
                    <i class="el-icon-time"></i>
                    <span style="margin-left: 10px">{{ scope.row.beginTime | formatDate }} ~
                      {{ scope.row.endTime | formatDate }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column align="center" width="180">
              <template slot-scope="scope">
                <div>
                  完成时间
                </div>
                <template v-if="scope.row.status == false">
                  <el-tag type="info">进行中</el-tag>
                </template>
                <template v-else>
                  <el-tag v-if="scope.row.finishTime <= scope.row.endTime" type="success">
                    <i class="el-icon-time"></i>
                    {{ scope.row.finishTime }} 按时完成</el-tag>
                  <el-tag v-else type="danger">
                    {{ scope.row.finishTime }} 延期完成
                  </el-tag>
                </template>
              </template>
            </el-table-column>

            <el-table-column>
              <template slot-scope="scope">
                <div>
                  <div style="padding-left:10px">开发者</div>
                  <div style="min-width:300px;">
                    <template v-if="scope.row.status == false">
                      <el-tag style="margin:0 4px" v-for="(o, index) in scope.row.iterationDetails" :key="index" effect="plain" size="small">{{ o.user.name }}</el-tag>
                    </template>
                    <template v-else>
                      <el-tag style="margin:0 4px" v-for="(o, index) in scope.row.iterationDetails" :key="index" effect="plain" size="small">{{ o.user.name }} AC: {{ o.ac }}</el-tag>
                    </template>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column fixed="right" width="120" v-if="permission">
              <template slot-scope="scope" v-if="scope.$index == 0">
                <template v-if="scope.row.status == false">
                  <el-button type="text" @click="finishIterate(scope.$index, scope.row)">完成</el-button>
                  <el-button type="text" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                </template>
                <template v-else>
                  <el-button type="text" @click="modifyIterate(scope.$index, scope.row)">修改</el-button>
                </template>

                <el-popconfirm @onConfirm="handledDelete(scope.$index, scope.row)" confirmButtonType="danger" confirmButtonText="删除" cancelButtonText="取消" icon="el-icon-info" iconColor="red" title="AC记录也会被删除,谨慎操作">
                  <el-button style="margin-left:10px;" slot="reference" type="text">删除</el-button>
                </el-popconfirm>
              </template>
            </el-table-column>

            <template slot="empty">
              <div style="height:200px;">
                <div style="margin-top:100px;">
                  <svg-icon icon-class="null" style="font-size:32px" /> <br />
                </div>
                <div style="line-height: 10px;">
                  <span>没有迭代记录</span>
                </div>
              </div>
            </template>
          </el-table>
        </div>

        <!-- bug表格 -->
        <div v-else>
          <el-table key="bug" :data="buglist" :show-header="false">
            <el-table-column>
              <template slot-scope="scope">
                <p>
                  <el-popover placement="bottom" title="标题" width="358" trigger="hover">
                    <div>
                      <p>
                        {{ scope.row.description }}
                      </p>
                    </div>
                    <span slot="reference">
                      <span>{{ scope.row.title }}</span>
                    </span>
                  </el-popover>
                </p>

                <p>
                  <span>提交与 {{ scope.row.insertTime | formatDate }}</span>
                  <span style="margin: 0 8px">
                    状态：
                    <el-tag v-if="scope.row.status == undefined">
                      待确认</el-tag>
                    <el-tag v-else-if="scope.row.status">bug成立</el-tag>
                    <el-tag v-else>bug不成立</el-tag>
                  </span>
                  <span v-if="scope.row.status">
                    bug责任人：
                    <el-tag effect="plain" v-for="(item, index) in scope.row.bugDetails" :key="index" style="margin:0 8px">{{ item.user.name }} AC: {{ item.ac }}</el-tag>
                  </span>
                </p>
              </template>
            </el-table-column>

            <el-table-column label="tttt" fixed="right" width="100px">
              <template slot-scope="scope">
                <template v-if="scope.row.status == undefined">
                  <template v-if="uid == scope.row.reporterid">
                    <el-button type="text" @click="editBug(scope.row)" size="small" icon="el-icon-edit">
                    </el-button>
                    <el-button type="text" @click="deleteBug(scope.row.id)" size="small" icon="el-icon-delete">
                    </el-button>
                  </template>
                </template>
                <template v-else>
                  <span>已处理</span>
                </template>
              </template>
            </el-table-column>

            <template slot="empty">
              <div style="height:200px;">
                <div style="margin-top:100px;">
                  <svg-icon icon-class="null" style="font-size:32px" /> <br />
                </div>
                <div style="line-height: 10px;">
                  <span>没有bug记录</span>
                </div>
              </div>
            </template>
          </el-table>
        </div>
      </div>
    </div>

    <iterate-dialog :pid="pid" :title="title" :cnt="cnt" :show.sync="idialog_show" :edit="tmp" @submitted="handleSubmitted" />

    <finish-drawer :iterate="finishtmp" :modify="modifyAC" :title="title" :serial="serial" :show.sync="bdrawer_show" @submitted="handleSubmitted" />

    <el-dialog title="报告bug" :visible.sync="bugDialog" @close="handleClose">
      <div v-loading="loading" style="width:100%">
        <el-form :data="buglist" :rules="rules" ref="bugform" :model="bugform">
          <el-form-item prop="title">
            <el-input v-model="bugform.title" placeholder="标题"></el-input>
          </el-form-item>
          <el-form-item prop="description">
            <el-input type="textarea" :rows="4" placeholder="描述" v-model="bugform.description">
            </el-input>
          </el-form-item>
        </el-form>
        <!-- <div>
          {{ bugform }}
          <el-divider></el-divider>
        </div> -->
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="bugDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitBug">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { addBug, listProjectBug, rmBug } from "@/api/bug.js";
import { getProjectDetail, rmIteration } from "@/api/project.js";
import IterateDialog from "./iterateDialog";
import FinishDrawer from "./finishDrawer";
export default {
  data() {
    return {
      bdrawer_show: false,
      idialog_show: false,
      bugDialog: false,
      radio: "迭代",
      show: false,
      drawer: false,
      dialog: false,
      title: "",
      pid: "",
      serial: 0,
      ilist: [],
      buglist: [],
      cnt: "--",
      success: "--",
      tmp: {},
      finishtmp: {},
      modifyAC: false,
      uid: "",
      authorid: "",
      loading: false,
      bugform: {
        id: "",
        title: "",
        project: {
          id: ""
        },
        description: ""
      },
      rules: {
        title: [{ required: true, message: "请输入标题", trigger: "blur" }],
        description: [
          { required: true, message: "请输入内容", trigger: "blur" }
        ]
      }
    };
  },
  components: { IterateDialog, FinishDrawer },
  computed: {
    permission() {
      return this.authorid == this.uid ? true : false;
    }
  },
  created() {
    this.uid = sessionStorage.getItem("uid");
    this.pid = this.$route.params.id;
    if (this.$route.params.tab) {
      this.radio = this.$route.params.tab;
    }
    this.fetchProjectDetail();
    this.fetchProjectBug();
    this.bugform.project.id = this.pid;
  },
  methods: {
    handleSubmitted() {
      this.fetchProjectDetail();
    },
    finishIterate(index, row) {
      this.modifyAC = false;
      this.serial = row.cnt;
      this.finishtmp = row;
      this.bdrawer_show = true;
    },
    modifyIterate(index, row) {
      this.modifyAC = true;
      this.serial = row.cnt;
      this.finishtmp = row;
      this.bdrawer_show = true;
    },
    fetchProjectDetail() {
      getProjectDetail(this.pid).then(res => {
        this.ilist = res.data.iterations;
        this.cnt = res.data.icnt;
        this.success = res.data.success;
        this.title = res.data.title;
        this.authorid = res.data.authorid;
        console.log(res.data);
      });
    },
    fetchProjectBug() {
      listProjectBug(this.pid).then(res => {
        this.buglist = res.data;
      });
    },
    newIteration() {
      if (this.ilist.length == 0 || this.ilist[0].status) {
        this.tmp = null;
        this.idialog_show = true;
      } else {
        this.$message({
          showClose: true,
          message: "有迭代未完成,无法新建",
          type: "warning"
        });
      }
    },
    handleEdit(index, row) {
      this.tmp = row;
      this.idialog_show = true;
    },
    handledDelete(index, row) {
      rmIteration(row.id).then(() => {
        this.$message({
          showClose: true,
          message: "删除成功",
          type: "success"
        });
        this.fetchProjectDetail();
      });
    },
    goBack() {
      this.$router.go(-1);
    },
    submitBug() {
      this.loading = true;
      this.bugform.project.id = this.pid;
      this.$refs.bugform.validate(valid => {
        if (valid) {
          addBug(this.bugform).then(() => {
            this.loading = false;
            this.fetchProjectBug();
            this.bugDialog = false;
          });
        } else {
          this.$message({
            showClose: true,
            message: "请填写必要信息",
            type: "error"
          });
        }
      });
    },
    editBug(val) {
      this.bugDialog = true;
      this.$nextTick(() => {
        this.bugform.id = val.id;
        this.bugform.title = val.title;
        this.bugform.description = val.description;
      });
    },
    async deleteBug(id) {
      await rmBug(id);
      await this.fetchProjectBug();
      this.$message({
        message: "删除成功",
        type: "success"
      });
    },
    handleClose() {
      this.$refs.bugform.resetFields();
      this.bugform.id = "";
    }
  }
};
</script>
<style lang="scss" scoped>
.app-container {
  padding: 10px 20px;
  background-color: #f5f5f5;
  min-height: 92vh;
}

.content {
  max-width: 1056px;
  margin-left: auto;
  margin-right: auto;
  min-height: 86vh;
}

.info {
  font-size: 14px;
  background-color: #ffffff;
  margin-top: 5px;
  height: 80px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  .value {
    margin-top: 16px;
    text-align: center;
  }
}

.iterate {
  background-color: #ffffff;
  margin-top: 10px;
  padding: 20px;
}
</style>
