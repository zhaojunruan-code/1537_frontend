module.exports = {
  apiUrl: '你的项目接口文档地址',  // 接口文档地址
  autoImport: true,  // 是否自动插入 request
  requestPath: 'import { request } from "@/http";',  // request 函数的路径
  outputFileName: 'api/index.js',  // 输出的接口文件名
};
