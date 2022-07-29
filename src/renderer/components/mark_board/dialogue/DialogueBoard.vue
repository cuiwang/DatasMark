<template>
  <el-card class="dialogueMark_card" shadow="never">
  <div slot="header" class="clearfix">
    <div style="height: 22px"></div>
    <div class="main-mark-toolbar">
      <div style="flex: 1; display: flex; align-items: center; justify-content: flex-start">
        <div class="mark-tip">
          <el-link type="success" v-if="data.status === DataType.FINISHED">已保存</el-link>
          <el-link type="primary" v-else-if="data.status === DataType.MARKING">标注中......</el-link>
          <el-link type="danger" v-if="data.wrong === 1">无效数据</el-link>
        </div>
      </div>
      <el-button-group>
        <el-button class="mark_page_button"
                   icon="el-icon-arrow-left"
                   :disabled="project.currectDataIndex === 0"
                   @click="getLastData">上一条
        </el-button>
        <el-button class="mark_page_button">
          <el-popover trigger="hover" placement="bottom">
            <div class="flex_col_allcenter">
              <el-input size="mini" v-model="inputDataIndex" type="number" placeholder="请输入数字">
                <el-button slot="append" icon="el-icon-search" @click="doChangeInputDataIndex"></el-button>
              </el-input>
              <div class="h5"></div>
              <el-pagination
                  :current-page="project.currectDataIndex + 1"
                  :page-size="1"
                  small
                  layout="prev, pager, next"
                  :total="project.num.total"
                  @current-change="onCurrentPageChange"
              ></el-pagination>
            </div>
            <span slot="reference">
              <span class="w15"></span>
              {{project.currectDataIndex + 1}} / {{project.num.total}}
              <i class="el-icon-caret-bottom"></i>
            </span>
          </el-popover>
        </el-button>
        <el-button class="mark_page_button"
                   :disabled="project.currectDataIndex === project.num.total - 1"
                   @click="getNextData">
          下一条
          <i class="el-icon-arrow-right el-icon--right"></i>
        </el-button>
      </el-button-group>
      <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end">

        <el-button v-if="data.status === DataType.FINISHED"
                   size="mini"
                   type="warning"
                   @click="onActiveButtonClick">激活
        </el-button>
        <el-button v-if="data.status === DataType.MARKING"
                   size="mini"
                   type="success"
                   @click="onFinishButtonClick">完成
        </el-button>
      </div>
    </div>
  </div>
    <div class="mark_dialogue_data" :style="{fontSize:defaultFontSize,color:defaultFontColor}">
      <div v-if="data.dialogue && data.dialogue.datas.length">
        <div v-for="(item, item_index) in data.dialogue.datas" :key="item_index">
          <el-row :gutter="18">
            <el-col :span="18">{{ `${item_index + 1}.${item.content}` }}</el-col>
            <el-col :span="6">
              <div class="flex_col_allcenter">
                <el-dropdown :disabled="data.status !== DataType.MARKING" @command="handleDialogueItemTagAdd">
                  <el-button type="primary">
                    下拉选择
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(item, dropdown_index) in projectDialogueType.datas"
                                      :key="dropdown_index"
                                      :command="`${item.tag}__${item_index}`">
                      {{ `${item.name} - ${item.tag}` }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <div>
                  <el-tag
                      :closable="data.status === DataType.MARKING"
                      v-for="(tag, tag_index) in item.tags"
                      :key="tag_index"
                      :disable-transitions="false"
                      @close="handleDialogueItemTagClose(tag, tag_index, item_index)"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-divider></el-divider>
        </div>
      </div>
      <div v-else>
        <el-empty description="分割异常,请检查后重试!">
          <span style="font-size: 10px; color: #999999">{{ data.content }}</span>
        </el-empty>
      </div>
    </div>
  </el-card>
</template>
<script>
import {Cons}   from '../../../Constant'

export default {
  name: 'DialogueBoard',
  props: {
    // 当前data
    currectData: {
      type: Object,
      required: true,
      default: {
        content: '',
        status: 0,
        wrong: 0,
        dialogue:{
          datas:[]
        }
      },
    },
    project: {
      type: Object,
      required: true
    },
    // 工程所用的一种对话标注标签组,从数据库中加载
    projectDialogueType:{
      type: Object,
      required: true,
    }
  },
  watch: {
    currectData(val) {
      this.data = val
    },
  },
  data() {
    return {
      inputDataIndex:0,
      data:this.currectData,
      DataType: Cons.DataType,
      defaultFontSize: '1.2rem',
      defaultFontColor: '#333333',

    }
  },
  mounted() {
    this.defaultFontSize = localStorage.getItem('defaultFontSize') || '1.2rem'
    this.defaultFontColor = localStorage.getItem('defaultFontColor') || '#333333'
  },
  methods: {
    // ────────────────────────── 对话标注 ──────────────────────────
    // 处理对话标注标签关闭
    handleDialogueItemTagClose(tag, tag_index, item_index) {
      this.data.dialogue.datas[item_index].tags.splice(tag_index, 1)
      this.$emit('doUpdateCurrectData',this.data)
    },
    // 处理对话标注标签添加
    handleDialogueItemTagAdd(value) {
      const _data = value.split('__')
      const tag = _data[0]
      const item_index = _data[1]
      if (!this.data.dialogue.datas[item_index].tags.includes(tag)) {
        this.data.dialogue.datas[item_index].tags.push(tag)
        this.$emit('doUpdateCurrectData',this.data)
      }
    },
    // ────────────────────────── / header ──────────────────────────
    // 用户手动输入页码索引
    doChangeInputDataIndex() {
      this.$emit('doChangeInputDataIndex',this.inputDataIndex)
    },
    // 上一条
    getLastData(event) {
      this.$emit('getLastData',event)
    },
    // 下一条
    getNextData(event) {
      this.$emit('getNextData',event)
    },
    // 下拉选择某一条
    onCurrentPageChange(index) {
      this.$emit('onCurrentPageChange',index)
    },
    // 点击激活按钮
    onActiveButtonClick(event) {
      this.$emit('onActiveButtonClick',event)

    },
    // 点击保存按钮,修改数据库状态和工程记录
    onFinishButtonClick(event) {
      this.$emit('onFinishButtonClick',event)

    },
  }
}
</script>
<style scoped>
</style>