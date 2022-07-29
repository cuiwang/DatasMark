export const Cons = {
  WorkingType: {
    ENTITY: 0, //实体标注
    RELATION: 1, //关系标注
    DIALOGUE: 2, //对话标注
  },
  DataType: {
    MARKING: 0, //标注中,未结束
    FINISHED: 1, //已结束/保存
  },

  ENCODINGS: ['utf8', 'utf16le', 'binary', 'base64', 'hex', 'ascii'],

  PROJECT_TEMPLATE: {
    name: '',
    created_at: '',
    updated_at: '',
    datasource_radio:'1',
    datasource_info:{
      host: '',
      port: '',
      user: '',
      password: '',
      database: '',
      table: '',
      column:'',
      charset: 'UTF8_GENERAL_CI',
    },//数据库等信息
    dataSync:false, //是否数据同步
    dataSyncToLocalTime:'',
    dataSyncToLocalNum:0,
    dataSyncToRemoteTime:'',
    dataSyncToRemoteNum:0,
    dataFilePath: '',
    currectDataIndex: 0,
    num: {
      total: 0,
      marked: 0,
    },
    markTypeId: '',
    markTypeName: '',
    globalTypeId: '',
    globalTypeName: '',
    relationTypeId: '',
    relationTypeName: '',
    dialogueTypeId: '',
    dialogueTypeName: '',
    description: '',
    working: false, //当前状态是否工作中/
  },

  DATA_TEMPLATE:{
    project_id: -1,
    created_at:'',
    updated_at:'',
    index: '',
    content: '',
    wrong: 0, //是否无法标注
    status: 0, //0标注中 1已完成
    tags: [], //实体标注
    relations: [], //关系标注
    dialogue: {
      separator: '',
      datas: [],
    }, //对话标注
    globalTypeId: '', //全局标注
  }
};
