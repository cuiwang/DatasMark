<template>
  <div>
    <el-dialog title="修改工程" :visible.sync="showDialog" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="projectForm" :model="projectForm" label-width="140px">
        <el-form-item label="工程名称" required>
          <el-input v-model="projectForm.name" clearable :maxlength="10" show-word-limit placeholder="请输入工程名称"></el-input>
        </el-form-item>
        <el-form-item label="实体标注标签组" required>
          <el-select v-model="projectForm.markTypeId" @change="onMarkTypeChanged" placeholder="请选择实体标注标签组,自定义标注请在对应管理页面配置">
            <el-option v-for="(markType, index) in markTypeDatas" :key="index" :label="`${getMaxString(markType.content)}`" :value="markType._id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input clearable v-model="projectForm.description" placeholder="请填写描述,方便理解和解释" maxlength="80" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="文本分类标注组">
          <el-select v-model="projectForm.globalTypeId" @change="onGlobalTypeChanged" placeholder="下拉选择需要的文本分类标注组">
            <el-option v-for="(markType, index) in globalTypeDatas" :key="index" :label="`${markType.content}`" :value="markType._id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关系标注标签组">
          <el-select v-model="projectForm.relationTypeId" @change="onRelationTypeChanged" placeholder="下拉选择需要的关系标注标签组">
            <el-option v-for="(markType, index) in relationTypeDatas" :key="index" :label="`${getMaxString(markType.content)}`" :value="markType._id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="对话标注标签组">
          <el-select v-model="projectForm.dialogueTypeId" @change="onDialogueTypeChanged" placeholder="下拉选择需要的对话标注标签组">
            <el-option v-for="(markType, index) in dialogueTypeDatas" :key="index" :label="`${markType.content}`" :value="markType._id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="数据源">
          <div class="flex_row align_center" style="height: 40px; justify-content: flex-start">
            <el-radio v-model="projectForm.datasource_radio" label="1">本地文件</el-radio>
            <el-radio v-model="projectForm.datasource_radio" label="2">远程文件</el-radio>
            <el-radio v-model="projectForm.datasource_radio" label="3">MySQL</el-radio>
            <el-radio v-model="projectForm.datasource_radio" label="4">MongoDB</el-radio>
          </div>
        </el-form-item>

        <!--修改mysql-->
        <el-form v-if="projectForm.datasource_radio==='3'" ref="projectForm" :model="projectForm.datasource_info" label-width="80px">
          <div class="h10"></div>
          <el-form-item required label="主机地址">
            <el-input v-model="projectForm.datasource_info.host" placeholder="127.0.0.1"></el-input>
          </el-form-item>
          <el-form-item required label="端口号">
            <el-input v-model="projectForm.datasource_info.port" placeholder="3306"></el-input>
          </el-form-item>
          <el-form-item required label="用户名">
            <el-input v-model="projectForm.datasource_info.user" placeholder="请填写有读写下面数据库权限的账号"></el-input>
          </el-form-item>
          <el-form-item required label="密码">
            <el-input v-model="projectForm.datasource_info.password" placeholder="请填写密码"></el-input>
          </el-form-item>
          <el-form-item required label="数据库名">
            <el-input v-model="projectForm.datasource_info.database" placeholder="请填写有读写权限的数据库名"></el-input>
          </el-form-item>
          <el-alert
              title="表名：开启数据同步，默认将覆盖此表，建议同步前修改此项！"
              type="warning"
          >
          </el-alert>
          <div class="h10"></div>
          <el-form-item required label="表名">
            <el-input v-model="projectForm.datasource_info.table" placeholder="请填写数据源表名"></el-input>
          </el-form-item>
          <el-form-item required label="字段名">
            <el-input v-model="projectForm.datasource_info.column" placeholder="请填写数据对应在表中的字段名"></el-input>
          </el-form-item>
          <el-form-item label="字符集">
            <el-input disabled v-model="projectForm.datasource_info.charset" placeholder="默认：'UTF8_GENERAL_CI'"></el-input>
          </el-form-item>

          <el-form-item>
            <div class="flex_row align_center" style="height: 40px; justify-content: flex-start">
              <el-button type="" @click="onTestMysqlConnectClick">测试连接</el-button>
              <el-button type="primary" @click="onPullMysqlDatasClick">测试读取数据</el-button>

            </div>
          </el-form-item>

        </el-form>
        <!--修改mongodb-->
        <el-form v-else-if="projectForm.datasource_radio==='4'" ref="projectForm" :model="projectForm.datasource_info" label-width="80px">
          <div class="h10"></div>
          <el-form-item required label="主机地址">
            <el-input v-model="projectForm.datasource_info.host" placeholder="127.0.0.1"></el-input>
          </el-form-item>
          <el-form-item required label="端口号">
            <el-input v-model="projectForm.datasource_info.port" placeholder="3306"></el-input>
          </el-form-item>
          <el-form-item required label="用户名">
            <el-input v-model="projectForm.datasource_info.user" placeholder="请填写有读写下面数据库权限的账号"></el-input>
          </el-form-item>
          <el-form-item required label="密码">
            <el-input v-model="projectForm.datasource_info.password" placeholder="请填写密码"></el-input>
          </el-form-item>
          <el-form-item required label="数据库名">
            <el-input v-model="projectForm.datasource_info.database" placeholder="请填写有读写权限的数据库名"></el-input>
          </el-form-item>
          <el-alert
              title="表名：开启数据同步，默认将覆盖此表，建议同步前修改此项！"
              type="warning"
          >
          </el-alert>
          <div class="h10"></div>
          <el-form-item required label="集合名">
            <el-input v-model="projectForm.datasource_info.table" placeholder="请填写数据源集合名"></el-input>
          </el-form-item>
          <el-form-item required label="字段名">
            <el-input v-model="projectForm.datasource_info.column" placeholder="请填写数据对应在集合中的字段名"></el-input>
          </el-form-item>

          <el-form-item>
            <div class="flex_row align_center" style="height: 40px; justify-content: flex-start">
              <el-button type="" @click="onTestMongodbConnectClick">测试连接</el-button>
              <el-button type="primary" @click="onPullMongodbDatasClick">测试读取数据</el-button>

            </div>
          </el-form-item>

        </el-form>
        <!--追加txt数据-->
        <el-form-item v-else label="是否追加数据">
          <div class="flex_row align_center" style="height: 40px; justify-content: flex-start">
            <el-switch v-model="isAppendDatas"></el-switch>
          </div>
        </el-form-item>
        <div v-show="isAppendDatas">
          <el-form-item label="字符集选择">
            <el-select v-model="encoding" @change="onEncodingChanged" placeholder="默认字符集utf-8">
              <el-option v-for="(encode, index) in encodings" :key="index" :label="encode" :value="encode"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据文件" required v-loading="isReadingFile">
            <div class="flex_row align_center" style="justify-content: flex-start">
              <el-upload
                  action="/"
                  :file-list="sourcefileList"
                  :on-change="handleSourceChange"
                  :limit="1"
                  accept=".txt,.TXT"
                  :on-exceed="handleSourceExceed"
                  :on-remove="handleSourceRemove"
                  :before-upload="beforeSourceUpload"
                  :auto-upload="false"
                  :multiple="false"
              >
                <div class="flex_row align_center">
                  <el-button size="small" type="info">点击上传txt数据</el-button>
                  <span class="w20"></span>
                  <span slot="tip" class="el-upload__tip">
                    只能上传txt文件，中文乱码请修改上面字符集.
                    <span style="font-weight: bold">按行</span>
                    读取txt数据
                  </span>
                </div>
              </el-upload>
            </div>
          </el-form-item>

        </div>

        <el-form-item v-if="uploadOriginalDatas.length" label="数据预览">
          <div class="file_upload_tips">
            解析成功!总共
            <span style="font-weight: bold; color: #ff7c00">{{ uploadOriginalDatas.length }}</span>
            条数据.前5条:
          </div>
          <div style="overflow: hidden; text-overflow: ellipsis"
               v-for="(item, index) in uploadOriginalDatas.slice(0, 5)">{{ index + 1 }} . {{ item }}
          </div>
        </el-form-item>

      </el-form>
      <div class="separate_line"></div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelButtonClick">取 消</el-button>
        <el-button type="warning" @click="saveEditProjectClick">确认修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import db_utils    from '../../libs/db_utils';
import fs          from 'fs';
import readline    from 'readline';
import {Cons}      from '../../Constant'
import DBHelper    from '../../libs/mysqlHelper'
import MongoHelper from '../../libs/mongoHelper'

export default {
  name: 'EditProject',
  props: {
    showDialog: {
      // 类型限制
      type: Boolean,
      // 默认值
      default: false,
      required: true,
    },
    projectForm: JSON.parse(JSON.stringify(Cons.PROJECT_TEMPLATE)),
  },
  data() {
    return {
      markTypeDatas: [], //从数据库中读取的实体标注标签组列表
      globalTypeDatas: [], //从数据库中读取的文本分类标注组列表
      relationTypeDatas: [], //从数据库中读取的关系标注标签组列表
      dialogueTypeDatas: [], //从数据库中读取的对话标注标签组列表
      encoding: 'utf-8',
      encodings:  Cons.ENCODINGS,
      isAppendDatas: false,
      isReadingFile: false, //是否正在解析文件
      sourcefileList: [],
      uploadOriginalDatas:[]

    };
  },
  mounted() {
    this.initEvent();
    this.initData();
  },
  methods: {
    initEvent() {
      this.$events.on('MARKTYPE_CHANGED', (text) => {
        this.initData();
      });
      this.$events.on('GLOBALTYPE_CHANGED', (text) => {
        this.initData();
      });
      this.$events.on('RELATIONTYPE_CHANGED', (text) => {
        this.initData();
      });
      this.$events.on('DIALOGUESETTING_CHANGED', (text) => {
        this.initData();
      });
    },
    checkedNewProjectItems() {
      if (!this.projectForm.name) {
        this.showMessageWithText('请填写工程名称')
        return false
      } else if (!this.projectForm.markTypeId) {
        this.showMessageWithText('请选择实体标注标签组')
        return false
      } else if (this.projectForm.datasource_radio==='3' && !this.projectForm.datasource_info.host&& !this.projectForm.datasource_info.port&& !this.projectForm.datasource_info.user&& !this.projectForm.datasource_info.password&& !this.projectForm.datasource_info.database&& !this.projectForm.datasource_info.table&& !this.projectForm.datasource_info.column ) {
        this.showMessageWithText('请按要求填写完整连接信息，并做好测试！')
        return false
      }else if (this.projectForm.datasource_radio==='3' && !this.projectForm.datasource_info.host&& !this.projectForm.datasource_info.port&& !this.projectForm.datasource_info.database&& !this.projectForm.datasource_info.table&& !this.projectForm.datasource_info.column ) {
        this.showMessageWithText('请按要求填写完整连接信息，并做好测试！')
        return false
      }
      return true;
    },
    // ────────────────────────── 选择文件上传组件 ──────────────────────────
    initData() {
      db_utils.find(db_utils.MARK_TYPES_DB, {}, (err, documents) => {
        this.markTypeDatas = [];
        for (const document of documents) {
          this.markTypeDatas.unshift(document);
        }
      });
      db_utils.find(db_utils.GLOBAL_TYPES_DB, {}, (err, documents) => {
        this.globalTypeDatas = [];
        for (const document of documents) {
          this.globalTypeDatas.unshift(document);
        }
      });
      db_utils.find(db_utils.RELATION_TYPES_DB, {}, (err, documents) => {
        this.relationTypeDatas = [];
        for (const document of documents) {
          this.relationTypeDatas.unshift(document);
        }
      });
      db_utils.find(db_utils.DIALOGUE_TYPES_DB, {}, (err, documents) => {
        this.dialogueTypeDatas = [];
        for (const document of documents) {
          this.dialogueTypeDatas.unshift(document);
        }
      });
    },
    // ────────────────────────── 分割线 ──────────────────────────
    // 设置最大显示长度的字符串
    getMaxString(str) {
      return str.length > 30 ? str.substring(0, 29) + '...' : str
    },
    // 选择实体标注标签组
    onMarkTypeChanged(_markTypeId) {
      // 通过id获取name
      db_utils.findOne(db_utils.MARK_TYPES_DB, { _id: _markTypeId }, (err, document) => {
        if (document) {
          this.projectForm.markTypeName = document.content;
        }
      });
    },
    onGlobalTypeChanged(_globalTypeId) {
      // 通过id获取name
      db_utils.findOne(db_utils.GLOBAL_TYPES_DB, { _id: _globalTypeId }, (err, document) => {
        if (document) {
          this.projectForm.globalTypeName = document.content;
        }
      });
    },
    onRelationTypeChanged(_relationTypeId) {
      // 通过id获取name
      db_utils.findOne(db_utils.RELATION_TYPES_DB, { _id: _relationTypeId }, (err, document) => {
        if (document) {
          this.projectForm.relationTypeName = document.content;
        }
      });
    },
    onDialogueTypeChanged(_dialogueTypeId) {
      // 通过id获取name
      db_utils.findOne(db_utils.DIALOGUE_TYPES_DB, { _id: _dialogueTypeId }, (err, document) => {
        if (document) {
          this.projectForm.dialogueTypeName = document.content;
        }
      });
    },
    // ────────────────────────── / 分割线 ──────────────────────────
    // 修改字符集
    onEncodingChanged(_encoding) {
      this.encoding = _encoding;
    },
    // ›››››››››››››››››››››››››››› 上传数据源 ‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹
    handleSourceChange(file, fileList) {
      const path = file.raw.path;
      if (path) {
        this.isReadingFile = true;
        // 保存文件路径到工程form,用于后续存储
        this.projectForm.dataFilePath = path;
        //用来存储结果的变量
        this.uploadOriginalDatas = [];

        //创建文件流
        const readstream = fs.createReadStream(path, {
          autoClose: true, //默认读取完毕后自动关闭
          encoding: this.encoding,
        });
        //创建逐行读取
        const rl = readline.createInterface({
          input: readstream,
        });

        rl.on('line', (data) => {
          this.uploadOriginalDatas.push(data);
        }).on('close', () => {
          //结束后调用的
          this.isReadingFile = false;
        });
      }
    },
    handleSourceExceed(files, fileList) {
      this.$message({
        message: `当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`,
        type: 'warning',
        offset: 70,
      });
    },
    handleSourceRemove(files, fileList) {
      this.isReadingFile = false;
      this.uploadOriginalDatas = [];
    },
    beforeSourceUpload(file) {
      const isTxt = file.type === 'txt';
      const isLt500M = file.size / 1024 / 1024 < 500;

      if (!isTxt) {
        this.$message.error('上传文件只能是 txt 格式!');
      }
      if (!isLt500M) {
        this.$message.error('上传文件大小不能超过 500MB!');
      }
      return isTxt && isLt500M;
    },

    // ────────────────────────── 编辑工程 ──────────────────────────
    // 保存按钮点击
    saveEditProjectClick() {
      // 1.校验 2.保存数据库 3通知更新
      if (this.checkedNewProjectItems()) {
        // 是否追加
        if (this.isAppendDatas){
          // 字段: _id,content,status,project_id,tags[{name,tag,start,end}]
          let datas = [];
          // 拿到最大索引
          // 获取最后一条的Index
          db_utils.find_datas_by_sort({project_id:this.projectForm._id},(err,docs)=>{
         const max_index = docs[0].index
            if (max_index){
              this.uploadOriginalDatas.forEach((content, index) => {

                let _data = JSON.parse(JSON.stringify(Cons.DATA_TEMPLATE))
                _data.project_id = this.projectForm._id
                _data.index = max_index+index+1
                _data.content = content
                datas.push(_data);
              });
              this.projectForm.num.total = docs.length+this.uploadOriginalDatas.length; // 重新设置总数

              // save to db
              // 更新数据源后保存到数据库
              db_utils.insert(db_utils.DATAS_DB, datas, (err, documents) => {
                db_utils.update(db_utils.PROJECTS_DB, { _id: this.projectForm._id }, this.projectForm);
                this.showMessageWithText('修改成功!', 'success');
                this.$events.emit('EDIT_PROJECT_SUCESS', this.projectForm._id);
                this.$emit('cancelButtonClick');
              });
            }
          })
        }else {
          // save to db
          // 保存到数据库
          db_utils.update(db_utils.PROJECTS_DB, { _id: this.projectForm._id }, this.projectForm);
          this.showMessageWithText('修改成功!', 'success');
          this.$events.emit('EDIT_PROJECT_SUCESS', this.projectForm._id);
          this.$emit('cancelButtonClick');
        }

      }
    },
    showMessageWithText(text, type = 'error') {
      this.$message({
        message: text,
        type: type,
        center: true,
        offset: 70,
      });
    },
    cancelButtonClick() {
      this.$emit('cancelButtonClick');
    },
    // ────────────────────────── / mysql ──────────────────────────
    onTestMysqlConnectClick() {
      if (!this.projectForm.datasource_info.host || !this.projectForm.datasource_info.port||!this.projectForm.datasource_info.user||!this.projectForm.datasource_info.password||!this.projectForm.datasource_info.database||!this.projectForm.datasource_info.table || !this.projectForm.datasource_info.column  ){
        this.showMessageWithText('请完成必填项!')
        return
      }
      let connection = new DBHelper().getConn(this.projectForm.datasource_info.host, this.projectForm.datasource_info.port,
          this.projectForm.datasource_info.user, this.projectForm.datasource_info.password, this.projectForm.datasource_info.database)
      connection.connect((err) => {
        // in case of error
        if (err) {
          this.db_err = err
          this.$message.error(err)
        } else {
          this.db_err = ''
          this.$message.success('连接可用,测试通过!')

        }
      })
    },
    onPullMysqlDatasClick() {
      if (!this.projectForm.datasource_info.host || !this.projectForm.datasource_info.port||!this.projectForm.datasource_info.user||!this.projectForm.datasource_info.password||!this.projectForm.datasource_info.database||!this.projectForm.datasource_info.table || !this.projectForm.datasource_info.column  ){
        this.showMessageWithText('请完成必填项!')
        return
      }
      let connection = new DBHelper().getConn(this.projectForm.datasource_info.host, this.projectForm.datasource_info.port,
          this.projectForm.datasource_info.user, this.projectForm.datasource_info.password, this.projectForm.datasource_info.database)
      connection.connect((err) => {
        // in case of error
        if (err) {
          this.db_err = err
          this.$message.error(err)
        } else {
          this.db_err = ''
          //this.$message.success('连接可用,测试通过!')
          // 读取数据
          let sql = `select ${this.projectForm.datasource_info.column} from ${this.projectForm.datasource_info.table}`
          connection.query(sql,(err,results)=>{
            if (err) {
              this.db_err = err
              this.$message.error(err)
            } else {
              this.db_err = ''
              this.uploadOriginalDatas = results.map(res=>{
                return res[this.projectForm.datasource_info.column]
              })
            }
          })
        }
      })
    },
    // ────────────────────────── / mongodb ──────────────────────────
    onTestMongodbConnectClick() {
      if (!this.projectForm.datasource_info.host || !this.projectForm.datasource_info.port||!this.projectForm.datasource_info.database||!this.projectForm.datasource_info.table || !this.projectForm.datasource_info.column  ){
        this.showMessageWithText('请完成必填项!')
        return
      }

      const db = new MongoHelper(this.projectForm.datasource_info.host, this.projectForm.datasource_info.port, this.projectForm.datasource_info.user, this.projectForm.datasource_info.password, this.projectForm.datasource_info.database, this.projectForm.datasource_info.table)
      db.getConn().then((conn) => {
        this.db_err = ''
        this.$message.success('连接可用,测试通过!')
        conn.close()
      }).catch((err) => {
        this.db_err = err
        this.$message.error(err)
      })

    },
    onPullMongodbDatasClick() {
      if (!this.projectForm.datasource_info.host || !this.projectForm.datasource_info.port||!this.projectForm.datasource_info.database||!this.projectForm.datasource_info.table || !this.projectForm.datasource_info.column  ){
        this.showMessageWithText('请完成必填项!')
        return
      }

      const db = new MongoHelper(this.projectForm.datasource_info.host, this.projectForm.datasource_info.port, this.projectForm.datasource_info.user, this.projectForm.datasource_info.password, this.projectForm.datasource_info.database, this.projectForm.datasource_info.table)

      db.getConn().then((conn) => {
        console.log('数据库已连接')
        const table = conn.db(this.projectForm.datasource_info.database).collection(this.projectForm.datasource_info.table)
        // 读取数据
        table.find({}).toArray((err, results)=> {
          // 返回集合中所有数据
          if (err) {
            this.db_err = err
            this.$message.error(err)
          }else {
            this.db_err = ''
            this.uploadOriginalDatas = results.map(res=>{
              return res[this.projectForm.datasource_info.column]
            })
          }
          conn.close();
        });
      }).catch((err) => {
        this.db_err = err
        this.$message.error(err)
      })


    },

  },
};
</script>

<style lang="scss" scoped>
@import '../../globals';
.el-select {
  width: 100%;
}
.el-select-dropdown__item{
  max-width: 540px;
}
</style>