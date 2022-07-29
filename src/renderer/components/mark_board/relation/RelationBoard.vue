<template>
  <el-card class="relationMark_card" shadow="never">
    <div ref="relationMark_card_header" slot="header" class="clearfix relationMark_header">
      <div class="flex_row align_center">
        <div v-if="!selectedRelationType || !selectedRelationType.tag"
             class="flex_row relationMark_tips"
             style="height: 38px">
          <el-alert effect="dark" title="没有选中标签" type="error" :closable="false" show-icon></el-alert>
        </div>
        <div v-else-if="!booleanRelationMarkFinish" class="flex_row relationMark_tips">
          <el-alert effect="dark" title="点击第一个" type="info" :closable="false" show-icon></el-alert>
        </div>
        <div v-else class="flex_row relationMark_tips">
          <el-alert effect="dark" title="点击第一个" type="success" :closable="false" show-icon></el-alert>
          <div class="w10"></div>
          <el-alert effect="dark" title="点击下一个" type="info" :closable="false" show-icon></el-alert>
        </div>
        <div class="w30"></div>
        <el-dropdown :disabled=" data.status !== DataType.MARKING">
          <span class="el-dropdown-link">
            {{selectedRelationType ? selectedRelationType.tag : '请选择关系标签'}}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="onRelationTypeClick(item)"
                              v-for="(item, index) in projectRelationType.datas"
                              :key="`projectRelationType_${index}`">
              <el-tag :color="item.color" size="medium" effect="dark">
                {{item.tag}}
              </el-tag>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="flex_1"></div>
        <div class="hidden-sm-and-down">
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
                  {{project.currectDataIndex + 1}} / {{project.num.total}}
                  <i class="el-icon-caret-bottom"></i>
                </span>
              </el-popover>
            </el-button>
            <!---->
            <el-button class="mark_page_button"
                       :disabled="project.currectDataIndex === project.num.total - 1"
                       @click="getNextData">
              下一条
              <i class="el-icon-arrow-right el-icon--right"></i>
            </el-button>
          </el-button-group>
        </div>
        <div class="flex_1"></div>
        <el-divider direction="vertical"></el-divider>
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
    <div class="mark_relation_data" :style="data_style()">
      <span v-for="(item, index) in relationItems" :key="`relationItems_${index}`">
        <el-tag :color="item.data.color"
                v-if="item.type === 'mark'"
                effect="dark"
                @click="onRelationItemClick(item, index)"
                :id="`mark_index_${index}`"
                type="primary">
          {{item.content}}
          <span style="font-size: 9px">({{item.data.name}})</span>
        </el-tag>
        <span v-else v-text="item.content.replace(/\\n/g,'\n\n')"/>
      </span>
    </div>
  </el-card>
</template>
<script>
import {Cons}            from '../../../Constant'
import LeaderLine        from 'leader-line-new'
import {sortArrayByProp} from '../../../libs/utils'

export default {
  name: 'RelationBoard',
  props: {
    // 当前data
    currectData: {
      type: Object,
      required: true,
      default: {
        content: '',
        status: 0,
        wrong: 0,
        dialogue: {
          datas: []
        }
      }
    },
    project: {
      type: Object,
      required: true
    },
    // 工程所用的一种对话标注标签组,从数据库中加载
    projectRelationType: {
      type: Object,
      required: true
    }
  },
  watch: {
    currectData(val) {
      this.data = val
      this.renderLines()
    }
  },
  data() {
    return {
      inputDataIndex: 0,
      data: this.currectData,
      DataType: Cons.DataType,
      defaultFontSize: '1.2rem',
      defaultFontColor: '#333333',
      //
      relationItems: [], //处理后的关系标注数据
      booleanCloseLeaderLine: false, //是否关闭连线
      relationLines: [], //Lines实例列表，用于统一销毁
      booleanRelationMarkFinish: false, //标识是否标记关系完成，需要成对标记
      tmpSelectedRelationItem: null, //第一次选择的标注，缓存一下
      selectedRelationType: null //下拉选中的关系
    }
  },
  mounted() {
    this.defaultFontSize = localStorage.getItem('defaultFontSize') || '1.2rem'
    this.defaultFontColor = localStorage.getItem('defaultFontColor') || '#333333'
    this.booleanCloseLeaderLine = localStorage.getItem('booleanCloseLeaderLine') === '1'
    this.renderLines()
    this.$events.on('doDeleteOneRelationLine', (index) => {
      this.doDeleteOneRelationLine(index)
    })
    this.$events.on('doShowRelationLine', (index) => {
      this.doShowRelationLine(index)
    })
    this.$events.on('doHideRelationLine', (index) => {
      this.doHideRelationLine(index)
    })
    this.$events.on('onEndRelationMarkClick', (index) => {
      this.doDeleteAllRelationLines()
      // 取消注册滚动事件
      document.removeEventListener('scroll', this.Scroll, true)
    })
    // 页面注册滚动事件
    document.addEventListener('scroll', this.Scroll, true)
    window.onresize = () => {
      return (() => {
        this.renderLines()
      })()
    }
  },
  destroyed() {
    this.doDeleteAllRelationLines()
    // 取消注册滚动事件
    document.removeEventListener('scroll', this.Scroll, true)
  },
  methods: {
    // 监听滚动事件
    Scroll() {
      if (this.relationLines.length > 0) {
        this.relationLines.forEach((line, index) => {
          line.position()
          if (index === 0) {
            if (line.start.getBoundingClientRect().top < 176) {
              this.$refs.relationMark_card_header.style.opacity = '0.5'
            }
            else {
              this.$refs.relationMark_card_header.style.opacity = '1.0'
            }
          }
        })
      }
    },
    data_style(){
      return `fontSize:${this.defaultFontSize};color:${this.defaultFontColor};line-height: calc(${this.defaultFontSize} + ${this.defaultFontSize});`
    },
    // ────────────────────────── / 分割线 ──────────────────────────
    renderLines() {
      this.doDeleteAllRelationLines() //清理上一步的标注
      this.relationItems = this.doGetRelationItems()
      this.$nextTick(() => {
        // 渲染完毕再执行这个，所以才能没有延时的更改
        if (!this.booleanCloseLeaderLine) {
          for (const relation of this.data.relations) {
            this.doAddRelationLine(`mark_index_${relation.start.index}`, `mark_index_${relation.end.index}`, relation.selectedRelationType)
            if (relation.show) {
              this.doShowRelationLine(this.relationLines.length - 1)
            }
          }
        }
      })
    },
    // 生成已标注的关系数据,按标注位置重新排列
    doGetRelationItems() {
      let markMap = []
      this.data.tags.forEach((value, index) => {
        value.index = index
        markMap.push(value)
      })
      // map中 按开始位置从小到大排序
      markMap = markMap.sort(this.sortArrayByProp('start'))
      let _content = this.data.content
      let relationItems = []
      let lastPosition = 0
      markMap.reduce((previousValue, currentValue, currentIndex) => {
        // 嵌套
        if (currentValue['start'] >= previousValue['start'] && currentValue['start'] <= previousValue['end']) {
          const mark_content = currentValue.content
          if (mark_content) {
            relationItems.push({
              type: 'mark',
              content: mark_content,
              data: currentValue
            })
          }
        }
        else {
          const text_content = _content.substring(lastPosition, currentValue.start)
          if (text_content) {
            relationItems.push({
              type: 'text',
              content: text_content
            })
          }
          const mark_content = currentValue.content
          if (mark_content) {
            relationItems.push({
              type: 'mark',
              content: mark_content,
              data: currentValue
            })
          }
        }
        lastPosition = currentValue.end
        return currentValue
      }, {
        'start': -1,
        'end': -1
      })
      const end_content = _content.substring(lastPosition)
      if (end_content) {
        relationItems.push({
          type: 'text',
          content: end_content
        })
      }
      return relationItems
    },
    // 下拉选中一个关系标注
    onRelationTypeClick(item) {
      this.selectedRelationType = item
    },
    // ────────────────────────── / 分割线 ──────────────────────────
    // 用户手动输入页码索引
    doChangeInputDataIndex() {
      this.$emit('doChangeInputDataIndex', this.inputDataIndex)
    },
    // 上一条
    getLastData(event) {
      this.$emit('getLastData', event)
    },
    // 下一条
    getNextData(event) {
      this.$emit('getNextData', event)
    },
    // 下拉选择某一条
    onCurrentPageChange(index) {
      this.$emit('onCurrentPageChange', index)
    },
    // 点击激活按钮
    onActiveButtonClick(event) {
      this.$emit('onActiveButtonClick', event)
    },
    // 点击保存按钮,修改数据库状态和工程记录
    onFinishButtonClick(event) {
      this.$emit('onFinishButtonClick', event)
    },
    // ────────────────────────── / 分割线 ──────────────────────────
    // 关系标注页面中,点击选中了一个实体
    onRelationItemClick(relationMarkItem, index) {
      if (this.data.status !== this.DataType.MARKING) {
        this.$message({
          type: 'error',
          message: '当前数据已保存,请点击[激活按钮]解除锁定'
        })
      }
      else {
        if (this.selectedRelationType && this.selectedRelationType.tag) {
          relationMarkItem.index = index //记录索引，用于下次进入还原现场
          //标注结束，存到数组，并开启新的标注
          if (this.booleanRelationMarkFinish) {
            // 1.插入数据
            const _id = new Date().getTime()
            this.data.relations.push({
              start: this.tmpSelectedRelationItem,
              end: relationMarkItem,
              selectedRelationType: this.selectedRelationType,
              show: true,
              id: _id
            })
            // 2.更新数据库
            this.$emit('doUpdateCurrectData', this.data)
            // 判断是否关闭显示连线
            if (!this.booleanCloseLeaderLine) {
              // 3.添加连线  mark_index_
              this.doAddRelationLine(`mark_index_${this.tmpSelectedRelationItem.index}`, `mark_index_${index}`, this.selectedRelationType)
              // 显示连线,最新添加的是最后一条
              this.doShowRelationLine(this.relationLines.length - 1)
            }
            this.tmpSelectedRelationItem = null
            this.booleanRelationMarkFinish = false
          }
          // 标注开始，记录第一个位置
          else {
            this.tmpSelectedRelationItem = relationMarkItem
            this.booleanRelationMarkFinish = true
          }
        }
        else {
          this.$message({
            type: 'warning',
            message: '请从右侧选择关系标签',
            offset: 70
          })
        }
      }
    },
    // ────────────────────────── / 分割线 ──────────────────────────
    // dom渲染结束，画关系线
    doAddRelationLine(start, end, tag) {
        // draw lines
        if (document.getElementById(start) && document.getElementById(end)) {
          const l1 = new LeaderLine(document.getElementById(start), document.getElementById(end), {
            color: tag.color,
            middleLabel: localStorage.getItem('booleanCloseLeaderLineTag') === '0' ? tag.tag : '',
            size: parseInt(localStorage.getItem('defaultLeaderLineWidth')) || 2,
            startSocket: 'bottom',
            endSocket: 'bottom',
            startPlug: 'disc',
            dropShadow: localStorage.getItem('booleanCloseLeaderLineShadow') === '0',
            dash: {
              // 虚线样式
              animation: true // 让线条滚动起来
            },
            hide: true
          })
          this.relationLines.push(l1)
        }
    },
    // 显示一条线
    doShowRelationLine(index) {
      if (this.relationLines[index]){
        this.relationLines[index].show('draw', {
          duration: 1200,
          timing: [0.2, 0.2, 0.6, 0.2]
        })
      }
    },
    // 隐藏一条线
    doHideRelationLine(index) {
      if (this.relationLines[index]) {
        this.relationLines[index].hide()
      }
    },
    // 删除一条关系标注线
    doDeleteOneRelationLine(index) {
      this.doHideRelationLine(index)
      this.relationLines.splice(index, 1)
    },
    // 删除所有关系线
    doDeleteAllRelationLines() {
      this.relationLines.forEach((item) => {
        item.remove()
      })
      this.relationLines = []
    },
    // ────────────────────────── 工具方法 ──────────────────────────
    // map key 排序
    sortArrayByProp(prop) {
      return sortArrayByProp(prop)
    }
  }
}
</script>
<style scoped>
</style>