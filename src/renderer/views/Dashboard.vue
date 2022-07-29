<template>
  <div id="content">
    <div class="content-fixed-header">
      <BoardHeader :project="project"/>
    </div>
    <!--中间操作区-->
    <div v-if="project.name && isDbIniting && isReady" class="main_container">
      <!--左侧标记区-->
      <div class="main_left_warp"
           v-bind:class="{ main_warp_bottom80: !booleanShowBaiduWord, main_warp_bottom10: currectWorkingType !== WorkingType.ENTITY }">
        <!--实体标注-->
        <div class="height_100 flex_col" v-if="currectWorkingType === WorkingType.ENTITY">
          <EntityBoard :currect-data="data" :project="project" :project-mark-type="projectMarkType"
                       @getLastData="getLastData"
                       @getNextData="getNextData"
                       @onCurrentPageChange="onCurrentPageChange"
                       @onActiveButtonClick="onActiveButtonClick"
                       @onFinishButtonClick="onFinishButtonClick"
                       @doChangeInputDataIndex="doChangeInputDataIndex"
                       @doUpdateCurrectData="doUpdateCurrectData"
                       @doLoadDataByIndex="doLoadDataByIndex"
          />
        </div>
        <!--关系标注-->
        <div class="height_100 flex_col" v-if="currectWorkingType === WorkingType.RELATION">
          <RelationBoard :currect-data="data" :project="project" :project-relation-type="projectRelationType"
                         @getLastData="getLastData"
                         @getNextData="getNextData"
                         @onCurrentPageChange="onCurrentPageChange"
                         @onActiveButtonClick="onActiveButtonClick"
                         @onFinishButtonClick="onFinishButtonClick"
                         @doChangeInputDataIndex="doChangeInputDataIndex"
                         @doUpdateCurrectData="doUpdateCurrectData"
          />
        </div>
        <!-- 对话标注 -->
        <div class="height_100 flex_col" v-if="currectWorkingType === WorkingType.DIALOGUE">
          <DialogueBoard :currect-data="data" :project="project" :project-dialogue-type="projectDialogueType"
                         @getLastData="getLastData"
                         @getNextData="getNextData"
                         @onCurrentPageChange="onCurrentPageChange"
                         @onActiveButtonClick="onActiveButtonClick"
                         @onFinishButtonClick="onFinishButtonClick"
                         @doChangeInputDataIndex="doChangeInputDataIndex"
                         @doUpdateCurrectData="doUpdateCurrectData"
          />
        </div>
      </div>
      <!--右侧操作区-->
      <div class="main_right_warp flex_col"
           v-bind:class="{ main_warp_bottom80: !booleanShowBaiduWord, main_warp_bottom10: currectWorkingType !== WorkingType.ENTITY }">
        <!--实体标注状态下-->
        <div class="height_100 flex_col" v-if="currectWorkingType === WorkingType.ENTITY">
          <!--分类标注选择-->
          <ClassifyOpthon v-if="project.globalTypeName" :currect-data="data" :project-global-type="projectGlobalType" @doUpdateCurrectData="doUpdateCurrectData"/>
          <!--开启对话标注-->
          <el-card v-if="project.dialogueTypeName" style="height: 60px;margin-bottom: 10px" shadow="never">
            <div slot="header" class="clearfix" style="text-align: left">
              <span>
                <i class="el-icon-s-comment"></i>
                对话标注
              </span>
              <el-button style="float: right; padding: 3px 0"
                         type="text"
                         @click="onStartDialogueMarkClick">开启标注
              </el-button>
            </div>
          </el-card>
          <!--开启关系标注-->
          <el-card v-if="project.relationTypeName" style="height: 60px;margin-bottom: 10px" shadow="never">
            <div slot="header" class="clearfix" style="text-align: left">
              <span>
                <i class="el-icon-s-marketing"></i>
                关系标注
              </span>
              <el-button style="float: right; padding: 3px 0"
                         type="text"
                         @click="onStartRelationMarkClick">开启标注
              </el-button>
            </div>
          </el-card>
          <!--实体标注数据-->
          <EntityOption v-if="project.markTypeName" :currect-data="data" :project-mark-type="projectMarkType" @doUpdateCurrectData="doUpdateCurrectData"/>
        </div>
        <!--关系标注状态下-->
        <div class="height_100 flex_col" v-if="currectWorkingType === WorkingType.RELATION">
          <RelationOption :currect-data="data" :project-relation-type="projectRelationType" @doUpdateCurrectData="doUpdateCurrectData" @doEndRelationMark="onEndRelationMarkClick"/>
        </div>
        <!--对话标注状态下-->
        <div class="height_100 flex_col" v-if="currectWorkingType === WorkingType.DIALOGUE">
          <DialogueOption :currect-data="data" :project-dialogue-type="projectDialogueType" @doUpdateCurrectData="doUpdateCurrectData" @doEndDialogueMark="onEndDialogueMarkClick"/>
        </div>
      </div>
      <!--  底部区域,句法分析-->
      <BaiduWords
          v-if="currectWorkingType === WorkingType.ENTITY"
          :currect-data="data"
          :project-mark-type="projectMarkType"
          :booleanShowBaiduWord.sync="booleanShowBaiduWord"
      />
    </div>
    <el-empty v-else description="准备未就绪">
      <el-button v-if="!project.working" type="primary" @click="openProjectView">激活标注工程</el-button>
      <el-button v-else-if="!isReady" type="warning" @click="openProjectView">数据异常，修改工程信息</el-button>
      <el-button v-else type="danger" @click="openProjectView">数据异常,请先修复工程!</el-button>
    </el-empty>
  </div>
</template>
<script>
import db_utils               from '../libs/db_utils'
import SeparatorTestComponent from '../components/SeparatorTestComponent'
import BaiduWords             from '../components/BaiduWords'
import {Cons}                 from '../Constant'
import DialogueBoard          from '../components/mark_board/dialogue/DialogueBoard'
import DialogueOption         from '../components/mark_board/dialogue/DialogueOption'
import ClassifyOpthon         from '../components/mark_board/classify/ClassifyOpthon'
import BoardHeader            from '../components/mark_board/BoardHeader'
import RelationOption         from '../components/mark_board/relation/RelationOption'
import RelationBoard          from '../components/mark_board/relation/RelationBoard'
import EntityOption           from '../components/mark_board/entity/EntityOption'
import EntityBoard            from '../components/mark_board/entity/EntityBoard'

export default {
  name: 'Dashboard',
  components: {
    EntityBoard,
    EntityOption,
    RelationBoard,
    RelationOption,
    BoardHeader,
    ClassifyOpthon,
    DialogueOption,
    DialogueBoard,
    BaiduWords,
    SeparatorTestComponent
  },
  data() {
    return {
      isReady: false,
      //=========================== 本地数据库 ===========================
      booleanAutoFinish: true, //是否自动保存
      isDbIniting: true, //数据库是否通知初始化完毕
      // 当前工程信息,从数据库中加载
      project: JSON.parse(JSON.stringify(Cons.PROJECT_TEMPLATE)),
      // 当前文本信息,从数据库中加载
      data: JSON.parse(JSON.stringify(Cons.DATA_TEMPLATE)),
      DataType: Cons.DataType,
      // 工程所用的一种实体标注标签组,从数据库中加载
      projectMarkType: Object.freeze({datas: []}),
      // 工程所用的一种分类标注标签组,从数据库中加载
      projectGlobalType: Object.freeze({datas: []}),
      // 工程所用的一种关系标注标签组,从数据库中加载
      projectRelationType: Object.freeze({datas: []}),
      // 工程所用的一种对话标注标签组,从数据库中加载
      projectDialogueType: Object.freeze({datas: []}),
      //
      currectWorkingType: 0, // 工作模式 0:实体标注 1:关系标注 2:对话标注
      WorkingType: Cons.WorkingType,
      selectedMenuItemId: 0, //当前标注框选中的索引
      //=========================== 全局变量 ===========================
      booleanShowBaiduWord: false,
      //是否显示更多工程信息
      booleanShowProjectInfo: false,
      //是否鼠标选中结束,此时可以用快捷键标注
      isMouseSelectFinished: false
    }
  },
  mounted() {
    console.log('Dashboard mounted')
    this.initEvent()
    this.initView()
    this.initData()
  },
  methods: {
    // ────────────────────────── init ──────────────────────────
    initEvent() {
      // 数据库初始化完毕,一般在mounted后
      this.$events.on('DB_INIT_FINISH', (text) => {
        this.isDbIniting = true
        this.initData()
      })

      // 按键事件监听
      document.onkeydown = (e) => {
        //事件对象兼容
        let evn = e || event || window.event
        let key = evn.keyCode || evn.which || evn.charCode
        //console.log(evn);
        //console.log(key);
        // 当前处于实体标注情况
        // 48:0,49:1...57:9
        //键盘按键判断:左箭头-37;上箭头-38；右箭头-39;下箭头-40
        if ((evn.ctrlKey || evn.metaKey) && (key === 37 || key === 38)) {
          // 按下方向左/上键
          //this.decrease()
          this.getLastData(e)
        }
        else if ((evn.ctrlKey || evn.metaKey) && (key === 39 || key === 40)) {
          //按下方向右/下键
          this.getNextData(e)
          //this.increase()
        }
        else if ((evn.ctrlKey || evn.metaKey) && key === 13) {
          // 按下回车
          this.onFinishButtonClick(e)
          //do something
        }
      }
    },
    initView() {
    },
    initData() {
      // 是否显示百度分词
      this.booleanShowBaiduWord = localStorage.getItem('booleanShowBaiduWord') === '1'
      // 是否自动保存
      this.booleanAutoFinish = localStorage.getItem('booleanAutoFinish') === '1'
      // 从数据库读取工程信息,工程数据信息,工程标注集信息
      db_utils.findOne(db_utils.PROJECTS_DB, {working: true}, (err, document) => {
        if (document) {
          this.project = document
          this.doLoadDataByIndex(this.project.currectDataIndex)
        }
      })
    },
    // ────────────────────────── 页面操作 ──────────────────────────
    // 打开工程工程页面
    openProjectView() {
      this.$events.emit('PROJECT_VIEW', '')
    },
    // 从数据库读取文本信息数据
    getCurrectProjectDataByIndex(_id, _index) {
      db_utils.findOne(db_utils.DATAS_DB, {
        project_id: _id,
        index: _index
      }, (err, document) => {
        if (!document) {
          this.isReady = false
          return
        }
        this.data = document
        // 是否需要加载了实体标注标签组
        if (this.project.markTypeName) {
          db_utils.findOne(db_utils.MARK_TYPES_DB, {_id: this.project.markTypeId}, (err, document) => {
            this.projectMarkType = Object.freeze(document)
          })
        }
        // 是否需要加载了分类标注组
        if (this.project.globalTypeName) {
          db_utils.findOne(db_utils.GLOBAL_TYPES_DB, {_id: this.project.globalTypeId}, (err, document) => {
            this.projectGlobalType = Object.freeze(document)
          })
        }
        // 是否需要加载了关系标注标签组
        if (this.project.relationTypeName) {
          db_utils.findOne(db_utils.RELATION_TYPES_DB, {_id: this.project.relationTypeId}, (err, document) => {
            this.projectRelationType = Object.freeze(document)
            // 判断是否关系标注模式
            if (this.currectWorkingType === this.WorkingType.RELATION) {
              this.onStartRelationMarkClick()
            }
          })
        }
        // 是否需要加载了对话标签组
        if (this.project.dialogueTypeName) {
          db_utils.findOne(db_utils.DIALOGUE_TYPES_DB, {_id: this.project.dialogueTypeId}, (err, document) => {
            this.projectDialogueType = Object.freeze(document)
            // 判断是否对话标注模式,生成对话标注数据
            if (this.currectWorkingType === this.WorkingType.DIALOGUE) {
              this.onStartDialogueMarkClick()
            }
          })
        }
        // 保存索引记录
        db_utils.update(db_utils.PROJECTS_DB, {_id: this.project._id}, this.project)
        this.isReady = true
      })
    },
    // 通过索引加载文本数据
    doLoadDataByIndex(index) {
      if (this.project && this.project._id) {
        db_utils.count(db_utils.DATAS_DB, {project_id: this.project._id}, (err, count) => {
          if (count > 0) {
            this.getCurrectProjectDataByIndex(this.project._id, index)
          }
          else {
            this.isReady = false
            this.$message.error('数据错误')
          }
        })
      }
      else {
        this.$message.error('数据错误')
      }
    },
    // 更新当前数据信息
    doUpdateCurrectData(data) {
      db_utils.update(db_utils.DATAS_DB, {
        project_id: this.project._id,
        index: this.project.currectDataIndex
      }, data)
    },
    // ────────────────────────── / header ──────────────────────────
    // 点击激活按钮
    onActiveButtonClick(event) {
      if (!event.isTrusted) {
        //防止点击两次
        return
      }
      this.data.status = this.DataType.MARKING
      this.doUpdateCurrectData(this.data)
      this.project.num.marked = parseInt(this.project.num.marked) - 1
      this.project.num.marked = this.project.num.marked < 0 ? 0 : this.project.num.marked
      console.log(this.project.num.marked)
      db_utils.update_set(db_utils.PROJECTS_DB, {working: true}, {
        $set: {
          num: {
            total: this.project.num.total,
            marked: this.project.num.marked
          }
        }
      })

      this.$events.emit('onActiveButtonClick', '');

    },
    // 点击保存按钮,修改数据库状态和工程记录
    onFinishButtonClick(event) {
      if (!event.isTrusted) {
        //防止点击两次
        return
      }
      // 当前状态是标注中,才修改两个数据库
      if (this.data.status === this.DataType.MARKING) {
        this.data.status = this.DataType.FINISHED
        this.doUpdateCurrectData(this.data)
        this.project.num.marked = parseInt(this.project.num.marked) + 1
        db_utils.update_set(db_utils.PROJECTS_DB, {working: true}, {
          $set: {
            num: {
              total: this.project.num.total,
              marked: this.project.num.marked
            }
          }
        })
        this.$events.emit('onFinishButtonClick', '');

      }
    },

    // 用户手动输入页码索引
    doChangeInputDataIndex(inputDataIndex) {
      if (inputDataIndex > 0 && inputDataIndex <= this.project.num.total) {
        this.project.currectDataIndex = inputDataIndex - 1
        this.doLoadDataByIndex(this.project.currectDataIndex)
      }
      else {
        this.$message.error('错误位置')
      }
    },
    // 上一条
    getLastData(event) {
      if (!event.isTrusted || this.project.currectDataIndex === 0) {
        //防止点击两次
        return
      }
      this.project.currectDataIndex = this.project.currectDataIndex - 1
      this.doLoadDataByIndex(this.project.currectDataIndex)
    },
    // 下一条
    getNextData(event) {
      if (!event.isTrusted || this.project.currectDataIndex === this.project.num.total - 1) {
        //防止点击两次
        return
      }
      // 判断是否需要自动保存
      if (this.booleanAutoFinish) {
        // 自动保存
        this.onFinishButtonClick({isTrusted: true})
        // 读取数据
        this.project.currectDataIndex = this.project.currectDataIndex + 1
        this.doLoadDataByIndex(this.project.currectDataIndex)
      }
      else {
        // 提示是否需要自动保存
        // 判断是否有标记
        if (this.data.tags.length > 0) {
          // 弹出对话框
          this.$confirm('是否保存本次操作,并打开自动保存?', '操作提示', {
                confirmButtonText: '确定并自动保存',
                cancelButtonText: '取 消',
                type: 'warning'
              })
              .then(() => {
                this.$message({
                  type: 'success',
                  message: '设置成功!'
                })
                // 状态保存到本地
                this.booleanAutoFinish = true
                localStorage.setItem('booleanAutoFinish', this.booleanAutoFinish ? '1' : '0')
                // 自动保存
                this.onFinishButtonClick({isTrusted: true})
                // 读取数据
                this.project.currectDataIndex = this.project.currectDataIndex + 1
                this.doLoadDataByIndex(this.project.currectDataIndex)
              })
              .catch(() => {
                this.$message({
                  type: 'info',
                  message: '取消保存!'
                })
                // 读取数据
                this.project.currectDataIndex = this.project.currectDataIndex + 1
                this.doLoadDataByIndex(this.project.currectDataIndex)
              })
        }
        else {
          // 读取数据
          this.project.currectDataIndex = this.project.currectDataIndex + 1
          this.doLoadDataByIndex(this.project.currectDataIndex)
        }
      }
    },
    // 下拉选择某一条
    onCurrentPageChange(index) {
      this.project.currectDataIndex = index - 1
      this.doLoadDataByIndex(this.project.currectDataIndex)
    },
    // ────────────────────────── 对话标注 ──────────────────────────
    // 开启对话标注
    onStartDialogueMarkClick() {
      // 隐藏底部百度分词
      this.booleanShowBaiduWord = false
      // 标记开始关系标注
      this.currectWorkingType = this.WorkingType.DIALOGUE
      // 判断是否可以标注
      if (this.data.status !== this.DataType.MARKING) {
        this.$message({
          type: 'warning',
          message: '当前数据已保存,请点击[激活按钮]解除锁定'
        })
      }
    },
    // 结束对话标注
    onEndDialogueMarkClick() {
      this.currectWorkingType = this.WorkingType.ENTITY // 结束关系标注后回到实体标注
    },
    // ────────────────────────── 关系标注 ──────────────────────────
    // 开启关系标注
    onStartRelationMarkClick() {
      // 隐藏底部百度分词
      this.booleanShowBaiduWord = false
      // 标记开始关系标注
      this.currectWorkingType = this.WorkingType.RELATION
      // 判断是否可以标注
      if (this.data.status !== this.DataType.MARKING) {
        this.$message({
          type: 'error',
          message: '当前数据已保存,请点击[激活按钮]解除锁定'
        })
      }
    },
    // 结束关系标注
    onEndRelationMarkClick() {
      this.$events.emit('onEndRelationMarkClick', '')
      this.currectWorkingType = this.WorkingType.ENTITY // 结束关系标注后回到实体标注
    }
  }
}
</script>
<style lang="scss">
@import '../globals.scss';

.el-tag {
  border: none !important;
}

.content-fixed-header {
  left: 0;
  right: 0;
  position: fixed;
  z-index: 99;
  background-color: #ffffff;
  margin: 0 10px;
}

.main-mark-toolbar {
  position: fixed;
  top: 100px;
  left: 10px;
  right: 370px;
  height: 60px;
  box-sizing: border-box;
  padding: 20px;
  border: 1px solid #ebeef5;
  display: flex;
  z-index: 99;
  background-color: #ffffff;
  align-items: center;
}

.main_left_warp {
  position: fixed;
  top: 100px;
  left: 10px;
  right: 370px;
  bottom: 320px;
  overflow-y: hidden;

  .mark_data {
    color: #333333;
    padding: 40px 20px;
    white-space: pre-wrap;
    word-wrap: break-word;
    text-align: left;
    font-size: 1.2rem;

  }

  .mark_relation_data {
    color: #333333;
    padding: 20px;
    white-space: pre-wrap;
    word-wrap: break-word;
    text-align: left;
    font-size: 1.2rem;
  }

  .mark_dialogue_data {
    color: #333333;
    padding: 20px;
    white-space: pre-wrap;
    word-wrap: break-word;
    text-align: left;
    font-size: 1.2rem;
  }
}

.main_right_warp {
  position: fixed;
  top: 100px;
  right: 10px;
  bottom: 320px;
  width: 350px;
  overflow-y: hidden;
}

.main_warp_bottom80 {
  bottom: 80px;
}

.main_warp_bottom10 {
  bottom: 10px;
}

.main_warp_top100 {
  top: 100px;
}

.main_bottom_warp {
  position: fixed;
  height: 300px;
  bottom: 10px;
  left: 10px;
  right: 10px;
  overflow-y: hidden;

  .el-card__body {
    padding: 0;
  }
}

.main_bottom_warp_height60 {
  height: 60px;
}

.projectInfo_less {
  .el-card__body {
    padding: 5px 20px;
  }
}

//解决标题栏滚动问题
.relationMarkItems {
  height: 100%;
  display: flex;
  flex-direction: column;

  .el-card__body {
    flex: 1;
    overflow-y: auto;
  }
}


//解决标题栏滚动问题
.mark_card {
  flex: 1;
  display: flex;
  flex-direction: column;

  .el-card__body {
    flex: 1;
    overflow-y: auto;
  }
}

//解决标题栏滚动问题
.entityMarkItems {
  flex: 1;
  display: flex;
  flex-direction: column;

  .el-card__body {
    flex: 1;
    overflow-y: auto;
  }
}

//解决标题栏滚动问题
.relationMark_card {
  flex: 1;
  display: flex;
  flex-direction: column;

  .el-card__header {
    position: absolute;
    width: 100%;
  }

  .relationMark_header {
  }

  .el-card__body {
    flex: 1;
    overflow-y: auto;
    padding-top: 75px;
  }
}

.dialogueMark_card {
  flex: 1;
  display: flex;
  flex-direction: column;

  .el-card__body {
    flex: 1;
    overflow-y: auto;
  }

  .el-tag + .el-tag {
    margin-left: 10px;
  }
}

.relationMarkedAlert {
  width: 100%;

  .el-alert__content {
    width: 100%;
  }
}

.mark_page_button {
  border: none;
}

.element::-webkit-scrollbar {
  width: 0 !important;
}

.element {
  -ms-overflow-style: none;
}

.element {
  overflow: auto;
}

.el-tag {
  white-space: normal;
  height: auto;
}

.el-collapse-item__header {
  height: auto;
  line-height: initial;
  padding: 5px;
}

.selectedEntitys {
  display: flex;
  flex-wrap: wrap;
}

.el-dropdown-menu {
  max-width: 243px;
  max-height: 500px;
  overflow-y: scroll;
}

.el-dropdown-menu__item {
  display: inline-block;
}

.el-dropdown-menu__item span {
  min-width: 205px;
  display: inline-block;
}

.mark-tip {
  padding-top: 20px;
  z-index: 41 !important; //大于data_0:40
  position: sticky !important;
  position: -webkit-sticky !important;
  background: white;
  top: 0;
  text-align: left;
  width: 100%;
  font-size: 10px;
}
</style>