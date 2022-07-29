<template>
  <!--分类标注选择-->
  <el-card style="height: 122px;margin-bottom: 10px" shadow="never">
    <div slot="header" class="clearfix" style="text-align: left">
      <span>
        <i class="el-icon-menu"></i>
        分类标注
      </span>
    </div>
    <el-radio-group :disabled="data.status !== DataType.MARKING"
                    v-model="data.globalTypeId"
                    @change="onGlobalTypeChange">
      <el-radio v-for="(item, index) in projectGlobalType.datas"
                :key="`projectGlobalType_${index}`"
                :label="item.tag">{{ item.name }}
      </el-radio>
    </el-radio-group>
  </el-card>
</template>
<script>
import {Cons} from '../../../Constant'

export default {
  name: 'ClassifyOpthon',
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
    // 工程所用的一种对话标注标签组,从数据库中加载
    projectGlobalType:{
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
      data:this.currectData,
      DataType: Cons.DataType,

    }
  },
  methods: {
    // 修改分类标注标签组
    onGlobalTypeChange(_globalTypeId) {
      if (this.data.status === this.DataType.MARKING) {
        this.data.globalTypeId = _globalTypeId
        this.$emit('doUpdateCurrectData',this.data)
      }
    },
  }
}
</script>
<style scoped>
</style>