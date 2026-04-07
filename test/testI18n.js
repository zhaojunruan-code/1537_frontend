const fs = require('fs');
const path = require('path');

// 匹配中文字符和中文标点符号的正则表达式
const regex = /[\u4e00-\u9fa5，。；！？《》“”]+/g;

// 提取中文内容并生成 i18n 标识符
const generateKey = (text) => {
  return `TRANSLATION-${text.hashCode()}`;
};

// 字符串哈希函数
String.prototype.hashCode = function() {
  let hash = 0, i, chr;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};

const templateRegex = /<template>([\s\S]*?)<\/template>/;
const scriptRegex = /<script[\s\S]*?<\/script>/;

// 提取 Vue 文件的内容
const extractVueSections = (content) => {
  const templateMatch = content.match(templateRegex);
  const scriptMatch = content.match(scriptRegex);
  return {
    template: templateMatch ? templateMatch[1] : '',
    script: scriptMatch ? scriptMatch[0] : ''
  };
};

// 替换模板中的中文内容，保持插值表达式
const replaceChineseInTemplate = (content, textsToReplace) => {
  textsToReplace.forEach(text => {
    const key = generateKey(text);
    const replacement = `{{t('${key}')}}`; // 保留插值
    content = content.split(text).join(replacement);
  });
  return content;
};

// 替换脚本中的中文内容，不使用引号
const replaceChineseInScript = (content, textsToReplace) => {
  const tStatement = "const { t } = useI18n();";

  // 在脚本中添加 const { t } = useI18n(); 语句
  if (!content.includes(tStatement)) {
    content = content.replace(/(<script[\s\S]*?>)/, `$1\n${tStatement}`);
  }

  textsToReplace.forEach(text => {
    const key = generateKey(text);
    const replacement = `t('${key}')`; // 不带双引号
    content = content.replace(new RegExp(`"${text}"`, 'g'), replacement); // 替换带引号的文本
    content = content.replace(new RegExp(`'${text}'`, 'g'), replacement); // 替换带引号的文本
  });
  return content;
};

// 遍历目录并提取中文
const processVueFiles = (dirPath, outputPath, translations) => {
  fs.readdirSync(dirPath).forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    // 仅处理 .vue 文件
    if (stat.isFile() && file.endsWith('.vue')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      const { template, script } = extractVueSections(content);

      // 提取模板和脚本中的中文内容
      const chineseTextsFromTemplate = template.match(regex) || [];
      const chineseTextsFromScript = script.match(regex) || [];

      // 保存中文文本和生成标识符
      const allChineseTexts = [...new Set([...chineseTextsFromTemplate, ...chineseTextsFromScript])]; // 去重

      if (allChineseTexts.length > 0) { // 仅在有中文内容时进行操作
        allChineseTexts.forEach(text => {
          const key = generateKey(text);
          translations[key] = text; // 保存原文
        });

        // 替换模板中的中文内容
        let updatedTemplate = replaceChineseInTemplate(template, chineseTextsFromTemplate);

        // 替换脚本中的中文内容
        let updatedScript = replaceChineseInScript(script, chineseTextsFromScript);

        // 合并替换后的模板和脚本回到 Vue 文件内容中
        content = content.replace(template, updatedTemplate).replace(script, updatedScript);

        // 写入替换后的 Vue 文件
        fs.writeFileSync(filePath, content, 'utf-8');
      } else {
        console.log(`没有匹配到中文: ${filePath}`);
      }
    } else if (stat.isDirectory()) {
      // 递归处理子目录，并传递 translations 对象
      processVueFiles(filePath, outputPath, translations);
    }
  });
};

// 使用方法：指定输入路径和输出路径
try {
  const inputDir = '../src/'; // 替换为你的 Vue 文件根目录
  const outputDir = '../src/language'; // 指定输出路径
  fs.mkdirSync(outputDir, { recursive: true }); // 确保输出目录存在

  const translations = {}; // 在这里定义 translations 对象
  const translationsFilePath = path.join(outputDir, 'zh.json');
  console.log("语言包路径: ", translationsFilePath);

  // 检查现有的翻译文件是否存在，如果存在则读取并合并
  if (fs.existsSync(translationsFilePath)) {
    const old = fs.readFileSync(translationsFilePath, 'utf-8');

    // 检查文件内容是否为空
    if (old.trim()) { // 确保内容不为空
      try {
        const existingTranslations = JSON.parse(old);

        // 检查是否解析为有效的对象
        if (typeof existingTranslations === 'object' && !Array.isArray(existingTranslations)) {
          Object.assign(translations, existingTranslations);
        } else {
          console.warn("解析后的内容不是一个有效的对象，使用空翻译对象。");
        }
      } catch (parseError) {
        console.error("解析翻译文件错误: ", parseError);
        console.warn("使用空翻译对象。");
      }
    } else {
      console.warn("翻译文件为空，将使用空翻译对象。");
    }
  }

  processVueFiles(inputDir, outputDir, translations);

  // 写入生成的 i18n 文件，包含原文
  fs.writeFileSync(translationsFilePath, JSON.stringify(translations, null, 2));
  console.log('I18N 处理完成');
} catch (e) {
  console.error("语言包处理错误: ", e);
}
