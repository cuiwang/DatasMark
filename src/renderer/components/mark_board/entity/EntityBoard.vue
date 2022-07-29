<template>
  <el-card class="mark_card" shadow="never" body-style="padding:0 20px 20px 20px">
    <div slot="header" class="clearfix">
      <div style="height: 22px"></div>
      <div class="main-mark-toolbar">
        <div style="flex: 1; display: flex; align-items: center; justify-content: flex-start">
          <el-checkbox :disabled="data.status === DataType.FINISHED"
                       @change="onWrongCheckboxChange"
                       v-model="data.wrong === 1">无效数据
          </el-checkbox>
        </div>
        <el-button-group class="hidden-sm-and-down">
          <el-button class="mark_page_button"
                     icon="el-icon-arrow-left"
                     :disabled="project.currectDataIndex === 0"
                     @click="getLastData">上一条
          </el-button>
          <el-button class="mark_page_button">
            <el-popover trigger="hover" placement="bottom">
              <div class="flex_col_allcenter">
                <el-input size="mini" v-model="inputDataIndex" type="number" placeholder="请输入数字">
                  <el-button slot="append" icon="el-icon-search" @click="doChangeInputDataIndex(inputDataIndex)"></el-button>
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
        <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end">
            <el-button :disabled="data.status === DataType.FINISHED"
                       size="mini"
                       icon="el-icon-edit-outline"
                       @click="onModifyButtonClick">编辑
            </el-button>
          <el-divider direction="vertical" />
            <el-button v-if="data.status === DataType.FINISHED"
                       size="mini"
                       type="primary"
                       icon="el-icon-refresh-left"
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
    <div class="main_mark flex_1">
      <div class="mark-tip flex_row align_center">
        <el-link type="danger" v-if="data.wrong === 1">无效数据</el-link>
        <el-link type="success" v-else-if="data.status === DataType.FINISHED">已完成</el-link>
        <el-link type="info" v-else-if="data.status === DataType.MARKING">标注中......</el-link>
        <div class="flex_1"></div>
        <div class="entity_search flex_row_allcenter">
          <el-input clearable size="small" placeholder="请输入搜索内容" v-model="entiitySearchContent" @clear="onClearEntitySearchText" @keyup.enter.native='doEntitySearchInText'>
            <i slot="prefix" class="el-input__icon el-icon-edit"></i>
            <el-button slot="append" icon="el-icon-search" :loading="isSearchEntity" @click="doEntitySearchInText"></el-button>
          </el-input>
          <template v-if="entiitySearchPositionResult.length > 0">
            <span class="normal_text_size normal_text_color" style="width: 100px;text-align: center">{{entiitySearchPositionResult.length}} 结果</span>
            <el-button size="mini" icon="el-icon-top" circle @click="doScrollToLastSearchData"></el-button>
            <el-button size="mini" icon="el-icon-bottom" circle @click="doScrollToNextSearchData"></el-button>
            <el-button size="mini" icon="el-icon-close" circle @click="onClearEntitySearchText"></el-button>
          </template>
        </div>
      </div>
      <!--开启行内标注,默认换行分割符"\n"   -->
      <div class="mark_data"
           id="data_0"
           :style="data_style()"
           v-text="data.content.replace(/\\n/g,'\n\n')"/>
    </div>
  </el-card>
</template>
<script>
import {Cons}     from '../../../Constant'
import EasyMarker from '../../../libs/easy-marker'
//import EasyMarker from '../libs/easy-marker.esm';


export default {
  name: 'EntityBoard',
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
    // 工程所用的一种标注标签组,从数据库中加载
    projectMarkType:{
      type: Object,
      required: true,
    }
  },
  watch: {
    currectData(val) {
      this.data = val
    },
    projectMarkType(){
      this.readerMark()
    }

  },
  data() {
    return {
      inputDataIndex:0,
      data: this.currectData,
      DataType: Cons.DataType,
      defaultFontSize: '1.2rem',
      defaultFontColor: '#333333',
      defaultMarkFontSize: '14px',
      // search
      isSearchEntity: false,
      currectSearchResultIndex: -1,
      entiitySearchContent: '',
      entiitySearchPositionResult: [],
      //实体标注显示类型 0高亮 1下划线
      defaultEntityRenderType: 0,
      isBaiduWordSelectFinished:false,//是否百度选择结束,可以快捷标记了

      //
      em: null, // 标注插件
    }
  },
  mounted() {
    this.initEvent()
    this.initData()
    this.initView()
  },
  methods: {

    initEvent(){
      this.$events.on('cancelHighlightLine', (line_id) => {
        this.cancelHighlightLine(line_id)
      });
      this.$events.on('doAddMarkData', (_tag, content, start, end) => {
        this.doAddMarkData(_tag, content, start, end)
      });
      this.$events.on('isBaiduWordSelectFinished', (data) => {
        this.isBaiduWordSelectFinished= data
      });
      this.$events.on('onActiveButtonClick', () => {
        this.em.enable()

      });
      this.$events.on('onFinishButtonClick', () => {
        this.em.disable()
      });

      window.onresize = () => {
        return (() => {
          this.readerMark()
        })();
      };

      // 按键事件监听
      document.onkeydown = (e) => {
        //事件对象兼容
        let evn = e || event || window.event
        let key = evn.keyCode || evn.which || evn.charCode
        //console.log(evn);
        //console.log(key);
        // 当前处于实体标注情况
          if ((evn.ctrlKey || evn.metaKey) && key === 90) {
            // 已完成状态,就不要操作了
            if (this.data.status === this.DataType.FINISHED) {
              return
            }
            // 按下CTRL+Z撤销键
            //删除最后一个标注
            if (this.data.tags.length > 0) {
              const tag = this.data.tags[this.data.tags.length - 1]
              this.$events.emit('onCloseTagClick', tag);
            }
          }
          else if ((evn.ctrlKey || evn.metaKey) && key === 49) {
            // 已完成状态,就不要操作了
            if (this.data.status === this.DataType.FINISHED) {
              return
            }
            // 按下数字1
            const index = key - 49
            this.doNumKeyEvent(index)
          }
          else if ((evn.ctrlKey || evn.metaKey) && key === 50) {
            // 已完成状态,就不要操作了
            if (this.data.status === this.DataType.FINISHED) {
              return
            }
            // 按下数字2
            const index = key - 49
            this.doNumKeyEvent(index)
          }
          else if ((evn.ctrlKey || evn.metaKey) && key === 51) {
            // 已完成状态,就不要操作了
            if (this.data.status === this.DataType.FINISHED) {
              return
            }
            // 按下数字3
            const index = key - 49
            this.doNumKeyEvent(index)
          }
          else if ((evn.ctrlKey || evn.metaKey) && key === 52) {
            // 已完成状态,就不要操作了
            if (this.data.status === this.DataType.FINISHED) {
              return
            }
            // 按下数字4
            const index = key - 49
            this.doNumKeyEvent(index)
          }
          else if ((evn.ctrlKey || evn.metaKey) && key === 53) {
            // 已完成状态,就不要操作了
            if (this.data.status === this.DataType.FINISHED) {
              return
            }
            // 按下数字5
            const index = key - 49
            this.doNumKeyEvent(index)
          }
          else if ((evn.ctrlKey || evn.metaKey) && key === 54) {
            // 已完成状态,就不要操作了
            if (this.data.status === this.DataType.FINISHED) {
              return
            }
            // 按下数字6
            const index = key - 49
            this.doNumKeyEvent(index)
          }
          else if ((evn.ctrlKey || evn.metaKey) && key === 55) {
            // 已完成状态,就不要操作了
            if (this.data.status === this.DataType.FINISHED) {
              return
            }
            // 按下数字7
            const index = key - 49
            this.doNumKeyEvent(index)
          }
          else if ((evn.ctrlKey || evn.metaKey) && key === 56) {
            // 已完成状态,就不要操作了
            if (this.data.status === this.DataType.FINISHED) {
              return
            }
            // 按下数字8
            const index = key - 49
            this.doNumKeyEvent(index)
          }
          else if ((evn.ctrlKey || evn.metaKey) && key === 57) {
            // 已完成状态,就不要操作了
            if (this.data.status === this.DataType.FINISHED) {
              return
            }
            // 按下数字9
            const index = key - 49
            this.doNumKeyEvent(index)
          }
      }
    },
    initData(){
      this.defaultFontSize = localStorage.getItem('defaultFontSize') || '1.2rem'
      this.defaultFontColor = localStorage.getItem('defaultFontColor') || '#333333'
      this.defaultMarkFontSize = localStorage.getItem('defaultMarkFontSize') || '14px'
      // 实体标注显示效果
      this.defaultEntityRenderType = localStorage.getItem('defaultEntityRenderType') || this.defaultEntityRenderType

    },
    initView(){
      this.readerMark()
    },
    data_style(){
      return `fontSize:${this.defaultFontSize};color:${this.defaultFontColor};line-height: calc(${this.defaultFontSize} + ${this.defaultFontSize});`
    },
    // ────────────────────────── / 分割线 ──────────────────────────
    // 按下数字键后的操作
    doNumKeyEvent(index) {
      //console.log(index);
      // 获取标注属性
      if (this.projectMarkType.datas.length > index) {
        const tag = this.projectMarkType.datas[index]
        this.selectedMenuItemId = index + 1
        //this.doChangeMenuItemBackgroud();
        // 判断是否可以快捷标注
        if (this.isMouseSelectFinished) {
          const selectText = this.em.getSelectText()
          const start = this.em.textNode.start
          const end = this.em.textNode.end
          //console.log({ tag, selectText, start, end });
          if (tag && selectText && start && end) {

            this.doAddMarkData( tag,selectText, start.offset, end.offset);

            this.em.menu.hide()
            this.em.mask.reset()
            this.isMouseSelectFinished = false //还原初始状态
          }
        }
        else if (this.isBaiduWordSelectFinished) {
          this.$events.emit('onMarkSelectedBaiduWord', tag);
        }
      }
    },

    // ────────────────────────── / 分割线 ──────────────────────────

    readerMark(){
      // 生成EasyMarker menuItems
      let menuItems = []
      this.projectMarkType.datas.forEach((data, index) => {
        menuItems.push({
          id: index + 1,
          text: data.tag,
          type: 'select',
          style: {
            width: '1000px',
            //overflow:'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: '#FFFFFF',
            background: data.color,
            boxSizing: 'border-box',
            borderTopLeftRadius: index === 0 ? '4px' : '0px',
            borderBottomLeftRadius: index === 0 ? '4px' : '0px',
            borderTopRightRadius: index === this.projectMarkType.datas.length - 1 ? '4px' : '0px',
            borderBottomRightRadius: index === this.projectMarkType.datas.length - 1 ? '4px' : '0px',
            borderLeft: '#DCDFE6 1px solid',
            borderRight: '#DCDFE6 1px solid',
            fontSize: this.defaultMarkFontSize,
            fontWeight: 'bold',
            padding: '10px'
          }
          //iconName:'iconfont icon-heartxin'
        })
      })
      // 配置显示菜单
      this.newEasyMarker(menuItems)
      this.doHighlightEasyMarkerMarkedDatas()
    },

    // 高亮标注了的数据
    doHighlightEasyMarkerMarkedDatas() {
      if (this.data.tags.length > 0) {
        //
        // { name: '人名', tag: 'Person', content: '李明', start: 27, end: 29 }
        let highlightOptions = []
        this.data.tags.forEach((data) => {
          highlightOptions.push({
            id: data.line_id,
            meta: {
              //type: 'underline',
              type: this.defaultEntityRenderType === 0 ? 'highlight' : 'underline',
              tag: data.tag,
              fillColor: data.color || '',
              underlineColor: data.color || ''
            },
            selection: {
              anchorNode: document.getElementById('data_0').firstChild,
              anchorOffset: data.start,
              focusNode: document.getElementById('data_0').firstChild,
              focusOffset: data.end
            }
          })
        })

        this.highlightLines(highlightOptions)
      }
    },
    // ────────────────────────── EasyMarker ──────────────────────────
    newEasyMarker(menuItems) {
      if (this.em) {
        this.em.destroy()
        this.em = null
      }
      this.em = new EasyMarker({
        menuTopOffset: '10px',
        mask: {
          color: '#DCDFE6'
        },
        highlight: {
          opacity: 0.5,
          //color: '#F2F1D7',//米白色 **
          //color: '#E8E8FF',//淡蓝色 *
          //color: '#D7FFF0',//淡绿色 **
          //color: '#F0DAD2',//淡红紫色 ***
          color: '#5EABFC', //淡红紫色
          tagBackground: 'transparent',
          tagColor: '#909399'
        },
        menuStyle: {
          menu: {
            borderRadius: '4px',
            padding: '0',
            backgroundColor: '#5EABFC',
            maxWidth: '749px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'auto'
            //height:'40px',
          },
          triangle: {
            borderTop: '0.4rem solid rgb(201, 209, 218)',
            borderRight: '0.4rem solid transparent',
            borderLeft: '0.4rem solid transparent',
            marginTop: '0px'
          }
        },
        menuItems: menuItems
      })
      this.em.create(document.querySelector('.main_mark'), undefined, {
        excludeElements: document.querySelectorAll('.excludeElements')
      })
      // 判断是否需要禁止编辑
      if (this.data.status === this.DataType.FINISHED) {
        this.em.disable()
      }
      else if (this.data.status === this.DataType.MARKING) {
        this.em.enable()
      }
      else {
        this.em.enable()
      }

      this.doEasyMarkerEvent()

    },
    // 设置EasyMarker事件
    doEasyMarkerEvent() {
      // 菜单点击行为
      this.em.onMenuClick((item_id, node_info, opthon) => {
        this.selectedMenuItemId = item_id
        //this.doChangeMenuItemBackgroud();
        this.cancelHighlightLine(opthon.id)
        this.doRemoveMarkData(opthon.id)
        const _tag = this.projectMarkType.datas[item_id - 1]
        // 添加到数据库
        this.doAddMarkData(_tag, this.em.getSelectText(), node_info.anchorOffset, node_info.focusOffset)
      })
      // onSelectStatusChange
      this.em.onSelectStatusChange((val) => {
        this.isMouseSelectFinished = val === 'finish'
      })
      // 取消高亮点击,这样才能弹出菜单
      this.em.onHighlightLineClick(null)

    },
    // 取消高亮
    cancelHighlightLine(line_id){
      this.em.cancelHighlightLine(line_id)
    },
    highlightLine(selection,_id,_params){
      this.em.highlightLine(selection, _id, _params)
    },
    highlightLines(highlightOptions){
      this.em.highlightLines(highlightOptions)
    },

    // 添加标注数据
    doAddMarkData(_tag, content, start, end) {
      // 0.高亮
      const _id = new Date().getTime()
      const selection = {
        anchorNode: document.getElementById('data_0').firstChild,
        anchorOffset: start,
        focusNode: document.getElementById('data_0').firstChild,
        focusOffset: end
      }
      this.highlightLine(selection, _id, {
        type: 'highlight',
        tag: _tag.tag,
        fillColor: _tag.color || ''
      })
      // 1.新增数据
      this.data.tags.push({
        name: _tag.tag,
        tag: _tag.tag,
        color: _tag.color,
        content: content,
        line_id: _id,
        start: start,
        end: end
      })
      // 2.更新数据库
      this.$emit('doUpdateCurrectData',this.data)
    },
    // 删除标注数据
    doRemoveMarkData(_id) {
      const _index = this.data.tags.findIndex((data) => {
        return data.line_id === _id
      })
      if (_index !== -1) {
        // 1.删除数据
        this.data.tags.splice(_index, 1)
        // 2.更新数据库
        this.$emit('doUpdateCurrectData',this.data)
      }
    },
    // ────────────────────────── / 分割线 ──────────────────────────
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
    //点击编辑按钮
    onModifyButtonClick() {
      this.$prompt('注意!注意!注意!\n修改文本内容,可能影响已标注结果!', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            roundButton: true,
            inputType: 'textarea',
            inputValue: this.data.content
          })
          .then(({value}) => {
            //console.log(value)
            this.data.content = value
            this.$emit('doUpdateCurrectData',this.data)
            // 重新读取数据
            this.$emit('doLoadDataByIndex',this.project.currectDataIndex)
            this.$message({
              type: 'success',
              message: '修改成功!'
            })
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '取消修改'
            })
          })
    },
    // 是否标记为无效数据
    onWrongCheckboxChange(_status, event) {
      if (!event.isTrusted) {
        //防止点击两次
        return
      }
      // 当前状态是标注中,才修改两个数据库
      this.data.wrong = _status ? 1 : 0
      this.$emit('doUpdateCurrectData',this.data)
    },
    // 点击激活按钮
    onActiveButtonClick(event) {
      this.$emit('onActiveButtonClick',event)

    },
    // 点击保存按钮,修改数据库状态和工程记录
    onFinishButtonClick(event) {
      this.$emit('onFinishButtonClick',event)
    },
    // ────────────────────────── / search ──────────────────────────
    // 搜索匹配到的位置
    doEntitySearchInText(event) {
      if (!event.isTrusted) {
        //防止点击两次
        return
      }
      this.doClearEntityResult()
      this.isSearchEntity = true
      if (this.entiitySearchContent && this.data.content) {
        // 循环查找位置
        this.entiitySearchPositionResult = []
        let pos = this.data.content.indexOf(this.entiitySearchContent) // 返回-1即未找到
        while (pos > -1) {
          const _res = {
            line_id: '',
            start: pos,
            end: pos + this.entiitySearchContent.length
          }
          this.entiitySearchPositionResult.push(_res) // 将出现的位置保存起来
          this.doAddSearchHighlightData(_res)
          pos = this.data.content.indexOf(this.entiitySearchContent, pos + 1)  // 从给定字符串出现的最后一位，开始继续查找
        }
        //console.log(this.entiitySearchPositionResult)
        this.isSearchEntity = false
      }
    },
    // 清空搜索框
    onClearEntitySearchText() {
      this.entiitySearchContent = ''
      this.doClearEntityResult()
    },
    // 清空已选搜索高亮
    doClearEntityResult() {
      this.entiitySearchPositionResult.forEach(value => {
        this.cancelHighlightLine(value.line_id)
      })
      this.entiitySearchPositionResult = []
      this.currectSearchResultIndex = -1
    },
    // 滚动到上一个
    doScrollToLastSearchData(event) {
      if (!event.isTrusted) {
        //防止点击两次
        return
      }
      this.currectSearchResultIndex = this.currectSearchResultIndex - 1
      if (this.currectSearchResultIndex < 0) {
        this.currectSearchResultIndex = 0
        this.$message('已经第一个了')
      }
      const _id = this.entiitySearchPositionResult[this.currectSearchResultIndex]['line_id']
      this.scrollToSearchDataById(_id)
      this.cancelHighlightLine(_id)
      this.doAddSearchHighlightData(this.entiitySearchPositionResult[this.currectSearchResultIndex], true)
      // 先判断是否需要取消上一步显示
      if (this.currectSearchResultIndex !== -1) {
        // 不是第一个,就需要取消显示上一个
        const _id = this.entiitySearchPositionResult[this.currectSearchResultIndex + 1]['line_id']
        this.cancelHighlightLine(_id)
        this.doAddSearchHighlightData(this.entiitySearchPositionResult[this.currectSearchResultIndex + 1])
      }
    },
    // 滚动到下一个
    doScrollToNextSearchData(event) {
      if (!event.isTrusted) {
        //防止点击两次
        return
      }
      this.currectSearchResultIndex = this.currectSearchResultIndex + 1
      if (this.currectSearchResultIndex > this.entiitySearchPositionResult.length - 1) {
        this.currectSearchResultIndex = this.entiitySearchPositionResult.length - 1
        //console.log('结尾了')
        this.$message('已经最后一个了')
      }
      const _id = this.entiitySearchPositionResult[this.currectSearchResultIndex]['line_id']
      this.scrollToSearchDataById(_id)
      this.em.cancelHighlightLine(_id)
      this.doAddSearchHighlightData(this.entiitySearchPositionResult[this.currectSearchResultIndex], true)
      // 先判断是否需要取消上一步显示
      if (this.currectSearchResultIndex !== 0) {
        // 不是第一个,就需要取消显示上一个
        const _id = this.entiitySearchPositionResult[this.currectSearchResultIndex - 1]['line_id']
        this.em.cancelHighlightLine(_id)
        this.doAddSearchHighlightData(this.entiitySearchPositionResult[this.currectSearchResultIndex - 1])
      }
    },
    // 滚动到高亮位置
    scrollToSearchDataById(_id) {
      const _rect = this.em.highlight.lineMap.get(_id).relativeRects[0]
      this.$el.querySelector('.mark_card .el-card__body')
          .scrollTo({
            top: _rect.top,
            behavior: 'smooth'
          })
    },
    // 添加搜索高亮
    doAddSearchHighlightData(data, isHighlight = false) {
      // 0.高亮
      const _id = new Date().getTime()
      data.line_id = _id
      const selection = {
        anchorNode: document.getElementById('data_0').firstChild,
        anchorOffset: data.start,
        focusNode: document.getElementById('data_0').firstChild,
        focusOffset: data.end
      }
      this.highlightLine(selection, _id, {
        type: this.defaultEntityRenderType === 0 ? 'underline' : 'highlight',
        tag: '',
        fillColor: isHighlight ? '#0eabe7' : '#CCCCCC',
        underlineColor: isHighlight ? '#0eabe7' : '#CCCCCC'
      })
    },
  }
}
</script>
<style scoped>
</style>