<template>
  <div class="board_header">
    <el-collapse-transition>
      <el-card v-if="booleanShowProjectInfo" style="height: 99px" shadow="never">
        <div class="flex_row align_center">
          <div class="flex_1 flex_row align_center">
            <div class="flex_col padding_0_10">
              <span class="main_text_color normal_text_size">标注进度</span>
              <span class="h5"></span>
              <div class="description_text_color description_text_size">
                {{`${project.num.marked}/${project.num.total}`}}
                <el-tooltip class="item" effect="dark" content="已保存/总数" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </div>
            </div>
            <div class="flex_1">
              <el-progress :percentage="onGetPercentage(project)"></el-progress>
            </div>
            <el-divider direction="vertical"></el-divider>
            <div class="flex_col padding_0_10">
              <span class="main_text_color normal_text_size">工程名称</span>
              <span class="h5"></span>
              <span class="description_text_color description_text_size">{{project.name}}</span>
            </div>
            <el-divider direction="vertical"></el-divider>
            <div class="flex_col padding_0_10">
              <span class="main_text_color normal_text_size">实体标注标签组</span>
              <span class="h5"></span>
              <div class="description_text_color description_text_size">
                {{getMaxString(project.markTypeName)}}
              </div>
            </div>
            <el-divider v-if="project.relationTypeName" direction="vertical"></el-divider>
            <div v-if="project.relationTypeName" class="flex_col padding_0_10">
              <span class="main_text_color normal_text_size">关系标注标签组</span>
              <span class="h5"></span>
              <div class="description_text_color description_text_size">
                {{getMaxString(project.relationTypeName)}}
              </div>
            </div>
            <el-divider v-if="project.dialogueTypeName" direction="vertical"></el-divider>
            <div v-if="project.dialogueTypeName" class="flex_col padding_0_10">
              <span class="main_text_color normal_text_size">对话标注标签组</span>
              <span class="h5"></span>
              <div class="description_text_color description_text_size">
                {{getMaxString(project.dialogueTypeName)}}
              </div>
            </div>
            <el-divider v-if="project.globalTypeName" direction="vertical"></el-divider>
            <div v-if="project.globalTypeName" class="flex_col padding_0_10">
              <span class="main_text_color normal_text_size">分类标注组</span>
              <span class="h5"></span>
              <div class="description_text_color description_text_size">
                {{getMaxString(project.globalTypeName)}}
              </div>
            </div>
            <el-divider direction="vertical"></el-divider>
          </div>
          <div>
            <i class="el-icon-arrow-up" @click="onShowProjectInfo('0')"></i>
          </div>
        </div>
      </el-card>
    </el-collapse-transition>
    <el-collapse-transition>
      <el-card v-if="!booleanShowProjectInfo" class="projectInfo_less" shadow="never">
        <div class="flex_row align_center">
          <div class="flex_1 flex_row align_center">
            <div class="flex_1">
              <el-progress :percentage="onGetPercentage(project)"></el-progress>
            </div>
            <el-divider direction="vertical"></el-divider>
            <div>
              <i class="el-icon-arrow-down" @click="onShowProjectInfo('1')"></i>
            </div>
          </div>
        </div>
      </el-card>
    </el-collapse-transition>
  </div>
</template>
<script>
import {getMaxString} from '../../libs/utils'

export default {
  name: 'BoardHeader',
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      //是否显示更多工程信息
      booleanShowProjectInfo: false,
    }
  },
  mounted() {
  },
  methods: {
    // 截取文本最大30字符
    getMaxString(str) {
     return  getMaxString(str)
    },
    // 获取标注进度百分比
    onGetPercentage(project) {
      if (project && project.num &&project.num.marked>-1 && project.num.total) {
        return Math.floor((project.num.marked * 100) / project.num.total)
      }
      else {
        return 0
      }
    },
    // 是否显示顶部工程信息
    onShowProjectInfo(value) {
      this.booleanShowProjectInfo = value === '1'
    }
  }
}
</script>
<style scoped>
</style>