const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config/api-config');  // 导入配置文件

const { apiUrl } = config;
const outputFilePath = path.join(__dirname, '../src/api/index.js');
const requestImport = 'import { request } from "@/http";';

// 辅助：将url转为合法驼峰函数名和类型名（只用路径部分，不含查询参数）
function urlToName(url, paramsInPath = []) {
  // 去除?及其后内容，只保留路径
  let pathPart = url.split('?')[0];
  // 去掉开头结尾斜杠，按/分割
  let parts = pathPart.replace(/^\/+/g, '').replace(/\/+$/g, '').split('/');
  // 路径参数替换为 ByXxx
  let nameParts = parts.map(part => {
    if (/^\{.+\}$/.test(part)) {
      let param = part.slice(1, -1);
      return 'By' + param.charAt(0).toUpperCase() + param.slice(1);
    }
    // 处理 -、_ 分隔，并保证每个单词首字母大写
    return part.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  });
  // 合并
  let base = nameParts.map((p, i) => i === 0 ? p.charAt(0).toLowerCase() + p.slice(1) : p).join('');
  // 如果有路径参数，结尾加 ByXxx
  if (paramsInPath.length > 0) {
    base += 'By' + paramsInPath.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('And');
  }
  // 只保留字母和数字
  return base.replace(/[^a-zA-Z0-9]/g, '');
}

function upperFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 解析参数结构生成 @param 注释
function genParamFields(params) {
  if (!Array.isArray(params) || params.length === 0) return '';
  return params.map(p => {
    let type = p.type || 'any';
    let name = p.field || p.name || '';
    let desc = p.description || p.desc || '';
    let example = p.example || '';
    let line = ` * @param {${type}} params.${name}`;
    if (desc) line += ` ${desc}`;
    if (example) line += `，例如：${example}`;
    return line;
  }).join('\n');
}

// 解析响应结构生成 @returns 注释
function genResponseFields(res) {
  if (!Array.isArray(res) || res.length === 0) return ' * @returns {Promise<any>} 接口响应数据';
  let fields = res.map(p => {
    let type = p.type || 'any';
    let name = p.field || p.name || '';
    let desc = p.description || p.desc || '';
    return `${name}: ${type}${desc ? ' // ' + desc : ''}`;
  }).join(', ');
  return ` * @returns {Promise<object>} 响应数据，结构如下：\n * { ${fields} }`;
}

// 递归构建嵌套类型结构
function buildNestedFields(paramList) {
  const tree = {};
  for (const p of paramList) {
    const path = p.key ? p.key.split('.') : [];
    let cur = tree;
    for (let i = 0; i < path.length; i++) {
      const seg = path[i];
      if (i === path.length - 1) {
        let type = p.field_type || (p.schema && p.schema.type) || 'any';
        if (type === 'integer') type = 'number';
        cur[seg] = {
          type,
          desc: p.description || p.desc || '',
        };
      } else {
        if (!cur[seg]) cur[seg] = {};
        cur = cur[seg];
      }
    }
  }
  return tree;
}

// 新风格：一行输出，类型全部 number，描述用 -
function printFields(tree, parentKey = '') {
  let lines = [];
  for (const key in tree) {
    const val = tree[key];
    if (val && typeof val === 'object' && !val.type) {
      // 嵌套对象
      lines.push(` * @property {object} ${parentKey ? parentKey + '.' : ''}${key} - 对象`);
      lines = lines.concat(printFields(val, parentKey ? parentKey + '.' + key : key));
    } else if (val && typeof val === 'object') {
      let type = val.type === 'integer' ? 'number' : val.type;
      if (type === 'array') type = 'array';
      if (type === 'integer') type = 'number';
      let desc = val?.desc && typeof val.desc === 'string' ? ' - ' + val.desc.replace(/\n/g, ' ') : '';
      lines.push(` * @property {${type}} ${parentKey ? parentKey + '.' : ''}${key}${desc}`);
    }
  }
  return lines;
}

function genParamTypedef(typedefBase, paramList) {
  if (!Array.isArray(paramList) || paramList.length === 0) {
    return `/**\n * @typedef {object} ${typedefBase}Params\n * @description 【请求参数】请补充字段说明\n */`;
  }
  const tree = buildNestedFields(paramList);
  const fields = printFields(tree).join('\n');
  return `/**\n * @typedef {object} ${typedefBase}Params\n${fields}\n */`;
}

function genResponseTypedef(typedefBase, resList) {
  if (!Array.isArray(resList) || resList.length === 0) {
    return `/**\n * @typedef {object} ${typedefBase}Response\n * @description 【响应数据】请补充字段说明\n */`;
  }
  const tree = buildNestedFields(resList);
  const fields = printFields(tree).join('\n');
  return `/**\n * @typedef {object} ${typedefBase}Response\n${fields}\n */`;
}

async function main() {
  const issueId = apiUrl.split('/detail/')[1] ? apiUrl.split('/detail/')[1].split('?')[0] : '';
  const previewUrl = issueId ? `https://docs.apipost.net/doc/preview?issue_id=${issueId}` : apiUrl;
  const apiListResp = await axios.get(previewUrl);
  const apiList = apiListResp.data.data.list;
  let fileContent = requestImport + '\n\n';

  for (let i = 0; i < apiList.length; i++) {
    const api = apiList[i];
    if (api.target_type !== 'api') continue;
    // 进度显示
    console.log(`正在处理 ${i + 1}/${apiList.length}: ${api.name}`);
    const { name, method, url, target_id } = api;
    const paramsInPath = (url.match(/\{(\w+)\}/g) || []).map(s => s.replace(/[{}]/g, ''));
    const funcBase = urlToName(url, paramsInPath);
    const functionName = funcBase.charAt(0).toLowerCase() + funcBase.slice(1);
    const typedefBase = upperFirst(funcBase);
    let paramList = paramsInPath.length > 0 ? paramsInPath.join(', ') : 'params = {}';
    const urlPath = url.split('?')[0];
    let urlStr = paramsInPath.length > 0 ?
      '`' + urlPath.replace(/\{(\w+)\}/g, '${$1}') + '`' :
      '"' + urlPath + '"';
    let dataStr = paramsInPath.length > 0 ? '{}' : 'params';

    // 拉取接口详情
    let paramFields = [], responseFields = [];
    try {
      const detailResp = await axios.post('https://docs.apipost.net/doc/details', {
        issue_id: issueId,
        target_ids: [target_id]
      });
      const detail = detailResp.data.data.list ? detailResp.data.data.list[0] : detailResp.data.data[0];
      // 合并所有参数类型
      let allParams = [];
      if (detail && detail.request) {
        if (detail.request.body && Array.isArray(detail.request.body.parameter)) allParams = allParams.concat(detail.request.body.parameter);
        if (detail.request.query && Array.isArray(detail.request.query.parameter)) allParams = allParams.concat(detail.request.query.parameter);
        if (detail.request.header && Array.isArray(detail.request.header.parameter)) allParams = allParams.concat(detail.request.header.parameter);
        if (detail.request.restful && Array.isArray(detail.request.restful.parameter)) allParams = allParams.concat(detail.request.restful.parameter);
      }
      paramFields = allParams;
      // 响应信息
      if (detail && detail.response && Array.isArray(detail.response.example) && detail.response.example[0] && Array.isArray(detail.response.example[0].raw_parameter)) {
        responseFields = detail.response.example[0].raw_parameter;
      }
    } catch (e) {
      paramFields = [];
      responseFields = [];
    }

    // 生成 typedef 注释直接放到 index.js
    fileContent += genParamTypedef(typedefBase, paramFields) + '\n';
    fileContent += genResponseTypedef(typedefBase, responseFields) + '\n';

    // JSDoc注释（仅保留 @param/@returns）
    const comment = `/**\n * ${name}\n * @param {${typedefBase}Params} ${paramsInPath.length > 0 ? paramsInPath.join(', ') : 'params'} 请求参数\n * @returns {Promise<${typedefBase}Response>} 响应数据\n */`;

    // 生成函数
    fileContent += `${comment}\nexport function ${functionName}(${paramList}) {\n  return request({\n    url: ${urlStr},\n    method: "${method.toLowerCase()}",\n    data: ${dataStr}\n  });\n}\n\n`;
  }

  console.log(`全部接口处理完成，共 ${apiList.length} 条。`);

  fs.writeFileSync(outputFilePath, fileContent.trim());
  console.log('API 生成完成');
}

main().catch(e => console.error('生成API失败:', e));

// ========== 新增：OpenAPI schema 解析工具 ==========
/**
 * 解析 schema 对象，生成字段注释
 * @param {object} schema OpenAPI schema
 * @param {string} prefix 字段前缀
 * @returns {string} JSDoc 字段注释
 */
function parseSchemaFields(schema, prefix = 'params') {
  if (!schema || !schema.properties) return '';
  return Object.entries(schema.properties).map(([key, prop]) => {
    let type = prop.type || 'any';
    let example = prop.examples && prop.examples.length > 0 ? prop.examples[0] : '';
    let desc = prop.description || '';
    let line = ` * @param {${type}} ${prefix}.${key}`;
    if (desc) line += ` ${desc}`;
    if (example !== '') line += `，例如：${example}`;
    return line;
  }).join('\n');
}

/**
 * 生成响应结构注释
 * @param {object} schema OpenAPI schema
 * @returns {string} JSDoc @returns 注释
 */
function parseResponseSchema(schema) {
  if (!schema || !schema.properties) return ' * @returns {Promise<any>} 接口响应数据';
  let fields = Object.entries(schema.properties).map(([key, prop]) => {
    let type = prop.type || 'any';
    return `${key}: ${type}`;
  }).join(', ');
  return ` * @returns {Promise<object>} 响应数据，结构如下：\n * { ${fields} }`;
}
// ========== END ==========
