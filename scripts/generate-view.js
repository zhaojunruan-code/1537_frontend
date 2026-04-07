/**
 * 根据 pages.json里的内容生成对应的vue模板文件
 * 使用:
 * ```cmd
 * node auto-pages.js
 * ````
 **/

const fs = require('fs');
const path = require('path');

const data = require('../src/pages.json');

data.pages.forEach(page => {
  const filePath = path.join('src/', `${page.path}.vue`);
  const dir = path.dirname(filePath);

  // const isTab = data.tabBar.list.find(i => i.pagePath === page.path);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }

  if (!fs.existsSync(filePath)) {
    /**
     * vue文件模板内容，可在这里根据你的项目来自定义
     * @type {string}
     */
    const vueTemplate = `<template>
</template>
<script setup>
</script>
<style scoped lang="scss">
</style>
`;
    fs.writeFileSync(filePath, vueTemplate, 'utf8');
    console.log(`生成模板: ${filePath}`);
  }
});
