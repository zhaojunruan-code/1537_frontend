const fs = require('fs');
const path = require('path');

// 匹配中文字符和中文标点符号的正则表达式（只匹配纯中文，不包含引号）
const chineseRegex = /[\u4e00-\u9fa5，。；！？《》]+/g;

// 需要忽略的目录
const ignoreDirs = ['node_modules', 'dist', 'build', '.git', '.vscode', 'coverage'];

// 生成i18n标识符
const generateKey = (text) => {
  return `TRANSLATION-${text.hashCode()}`;
};

// 字符串哈希函数
String.prototype.hashCode = function () {
  let hash = 0, i, chr;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash);
};

// 移除注释但保留字符串内容
const removeComments = (content, isScript = false) => {
  let result = content;

  if (isScript) {
    // 移除JS单行注释和多行注释，但保留字符串中的内容
    const strings = [];
    let stringIndex = 0;

    // 先提取字符串
    result = result.replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, (match) => {
      const placeholder = `__STRING_${stringIndex++}__`;
      strings.push(match);
      return placeholder;
    });

    // 移除注释
    result = result.replace(/\/\/.*$/gm, '');
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');

    // 恢复字符串
    strings.forEach((str, index) => {
      result = result.replace(`__STRING_${index}__`, str);
    });
  } else {
    // 移除HTML注释
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }

  return result;
};

// 提取中文文本（忽略注释）
const extractChineseTexts = (content, isScript = false) => {
  const contentWithoutComments = removeComments(content, isScript);
  const matches = contentWithoutComments.match(chineseRegex) || [];

  // 过滤掉过短的文本，确保至少2个字符
  return [...new Set(matches.filter(text => {
    const cleanText = text.trim();
    return cleanText.length >= 2;
  }))];
};

// 替换模板中的中文
const replaceTemplateText = (content, textMap) => {
  let result = content;

  // 按文本长度从长到短排序，避免短文本先被替换导致长文本被分割
  const sortedEntries = Object.entries(textMap).sort((a, b) => b[0].length - a[0].length);

  sortedEntries.forEach(([text, key]) => {
    const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 1. 插值表达式中的纯字符串 {{ "中文" }}
    result = result.replace(
      new RegExp(`\\{\\{\\s*["']${escapedText}["']\\s*\\}\\}`, 'g'),
      `{{ t('${key}') }}`
    );

    // 2. 插值表达式中的字符串 {{ someVar || "中文" }}
    result = result.replace(
      new RegExp(`(\\{\\{[^}]*?)["']${escapedText}["']([^}]*?\\}\\})`, 'g'),
      `$1t('${key}')$2`
    );

    // 2.1. 三元表达式特殊处理 {{ condition ? "中文1" : "中文2" }}
    result = result.replace(
      new RegExp(`(\\{\\{[^}]*?\\?)\\s*["']${escapedText}["']([^}]*?\\}\\})`, 'g'),
      `$1 t('${key}')$2`
    );
    result = result.replace(
      new RegExp(`(\\{\\{[^}]*?:)\\s*["']${escapedText}["']([^}]*?\\}\\})`, 'g'),
      `$1 t('${key}')$2`
    );

    // 2.2. 处理字符串中包含中文+其他字符的情况 {{ "登录中..." }}
    // 把 "中文xxx" 替换成 t('key') + 'xxx'
    result = result.replace(
      new RegExp(`(\\{\\{[^}]*?)["']${escapedText}([^"']*?)["']([^}]*?\\}\\})`, 'g'),
      (match, before, after, end) => {
        if (after) {
          // 有后缀，拆分成 t('key') + '后缀'
          return `${before}t('${key}') + '${after}'${end}`;
        }
        return `${before}t('${key}')${end}`;
      }
    );

    // 3. HTML属性中的中文 title="中文" -> :title="t('key')"
    result = result.replace(
      new RegExp(`(\\w+)\\s*=\\s*["']${escapedText}["']`, 'g'),
      `:$1="t('${key}')"`
    );

    // 4. 纯文本（在标签内的文本内容）
    // 处理类似 <text>纯文本</text> 的情况
    // 注意：避免匹配已经在 {{ }} 或引号内的文本
    result = result.replace(
      new RegExp(`(>[^<{]*?)${escapedText}([^<{]*?<)`, 'g'),
      (match, before, after) => {
        // 如果before或after包含引号或插值表达式，跳过
        if (before.includes('"') || before.includes("'") || before.includes('{{') ||
          after.includes('"') || after.includes("'") || after.includes('}}')) {
          return match;
        }
        return `${before}{{ t('${key}') }}${after}`;
      }
    );

    // 5. 独立行的纯文本（不在任何标签或表达式中）
    const lines = result.split('\n');
    result = lines.map(line => {
      // 如果行只有空白和中文，替换纯文本
      const trimmedLine = line.trim();
      if (trimmedLine === escapedText) {
        return line.replace(escapedText, `{{ t('${key}') }}`);
      }
      return line;
    }).join('\n');
  });

  return result;
};

// 在 t() 调用的上一行添加中文注释
const addCommentsAbove = (content, translations, isScript = false) => {
  const lines = content.split('\n');
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = line.match(/^(\s*)/)[1]; // 获取当前行的缩进

    // 查找所有 t('TRANSLATION-xxx') 调用
    const tCallMatches = line.matchAll(/t\('(TRANSLATION-\d+)'\)/g);
    const keys = [...tCallMatches].map(match => match[1]);

    if (keys.length > 0) {
      // Template 中的特殊情况判断
      let shouldSkip = false;

      if (!isScript) {
        // 1. 跳过属性中的 t() 调用
        // 例如: :placeholder="t('xxx')" 或 :title="t('xxx')"
        const isAttribute = /[:@]\w+\s*=.*t\(/.test(line);

        // 2. 跳过跨行标签的情况（行以 > 开头，说明标签跨多行）
        // 例如: >{{ t('xxx') }} 这种情况说明上面还有未闭合的标签
        const isMultiLineTag = line.trim().startsWith('>');

        shouldSkip = isAttribute || isMultiLineTag;
      }

      // 检查上一行是否已经有注释
      const prevLine = i > 0 ? lines[i - 1].trim() : '';
      const hasComment = isScript ? prevLine.startsWith('//') : prevLine.startsWith('<!--');

      if (!hasComment && !shouldSkip) {
        // 为每个 key 添加注释（如果有多个，只添加第一个）
        const key = keys[0];
        const text = translations[key];
        if (text) {
          const comment = isScript
            ? `${indent}// ${text}`
            : `${indent}<!-- ${text} -->`;
          result.push(comment);
        }
      }
    }

    result.push(line);
  }

  return result.join('\n');
};

// 替换脚本中的中文
const replaceScriptText = (content, textMap) => {
  let result = content;

  // 添加useI18n导入
  if (!result.includes('useI18n')) {
    if (result.includes('<script setup>')) {
      result = result.replace('<script setup>', '<script setup>\nconst { t } = useI18n();');
    } else if (result.includes('<script>')) {
      result = result.replace(/<script[^>]*>/, '$&\nconst { t } = useI18n();');
    }
  }

  // 按文本长度从长到短排序，避免短文本先被替换导致长文本被分割
  const sortedEntries = Object.entries(textMap).sort((a, b) => b[0].length - a[0].length);

  sortedEntries.forEach(([text, key]) => {
    const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const replacement = `t('${key}')`;

    // 1. 双引号字符串
    result = result.replace(new RegExp(`"${escapedText}"`, 'g'), replacement);

    // 2. 单引号字符串
    result = result.replace(new RegExp(`'${escapedText}'`, 'g'), replacement);

    // 3. 模板字符串
    result = result.replace(new RegExp('`' + escapedText + '`', 'g'), '`${' + replacement + '}`');

    // 4. 模板字符串中间部分
    result = result.replace(new RegExp('`([^`]*?)' + escapedText + '([^`]*?)`', 'g'), '`$1${' + replacement + '}$2`');

    // 5. 对象属性中的中文 (title: "中文")
    result = result.replace(
      new RegExp(`(\\w+\\s*:\\s*)["']${escapedText}["']`, 'g'),
      `$1${replacement}`
    );

    // 6. 函数参数中的中文 (func("中文"))
    result = result.replace(
      new RegExp(`(\\([^)]*?)["']${escapedText}["']([^)]*?\\))`, 'g'),
      `$1${replacement}$2`
    );

    // 7. 数组元素中的中文 (["中文1", "中文2"])
    result = result.replace(
      new RegExp(`(\\[[^\\]]*?)["']${escapedText}["']([^\\]]*?\\])`, 'g'),
      `$1${replacement}$2`
    );
  });

  return result;
};

// 提取Vue文件的各个部分
const extractVueSections = (content) => {
  // 手动查找最外层的template标签位置
  const templateStartIndex = content.indexOf('<template>');
  const templateEndIndex = content.lastIndexOf('</template>');

  const scriptStartMatch = content.match(/<script[\s\S]*?>/);
  const scriptEndIndex = content.lastIndexOf('</script>');

  let template = '';
  let script = '';
  let templateStart = -1;
  let templateEnd = -1;
  let scriptStart = -1;
  let scriptEnd = -1;

  if (templateStartIndex !== -1 && templateEndIndex !== -1) {
    templateStart = templateStartIndex;
    templateEnd = templateEndIndex + '</template>'.length;
    template = content.substring(templateStartIndex + '<template>'.length, templateEndIndex);
  }

  if (scriptStartMatch && scriptEndIndex !== -1) {
    scriptStart = scriptStartMatch.index;
    scriptEnd = scriptEndIndex + '</script>'.length;
    script = content.substring(scriptStart, scriptEnd);
  }

  return {
    template,
    script,
    templateStart,
    templateEnd,
    scriptStart,
    scriptEnd
  };
};

// 检查是否应该忽略该目录
const shouldIgnoreDir = (dirName) => {
  return ignoreDirs.some(ignoreDir => dirName.includes(ignoreDir));
};

// 处理Vue文件
const processVueFiles = (dirPath, outputPath, translations) => {
  if (!fs.existsSync(dirPath)) {
    console.error(`目录不存在: ${dirPath}`);
    return;
  }

  fs.readdirSync(dirPath).forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (shouldIgnoreDir(file)) {
        console.log(`忽略目录: ${filePath}`);
        return;
      }
      processVueFiles(filePath, outputPath, translations);
    } else if (stat.isFile() && file.endsWith('.vue')) {
      console.log(`处理文件: ${filePath}`);

      let content = fs.readFileSync(filePath, 'utf-8');
      const { template, script, templateStart, templateEnd, scriptStart, scriptEnd } = extractVueSections(content);

      // 提取中文文本（忽略注释）
      const templateTexts = extractChineseTexts(template, false);
      const scriptTexts = extractChineseTexts(script, true);

      const allTexts = [...new Set([...templateTexts, ...scriptTexts])];

      if (allTexts.length > 0) {
        console.log(`发现中文文本: ${allTexts.join(', ')}`);

        // 生成文本映射
        const textMap = {};
        allTexts.forEach(text => {
          const key = generateKey(text);
          textMap[text] = key;
          translations[key] = text;
        });

        // 替换模板中的文本
        let updatedTemplate = replaceTemplateText(template, textMap);
        // 在 t() 调用上一行添加注释
        updatedTemplate = addCommentsAbove(updatedTemplate, translations, false);

        // 替换脚本中的文本
        let updatedScript = replaceScriptText(script, textMap);
        // 在 t() 调用上一行添加注释
        updatedScript = addCommentsAbove(updatedScript, translations, true);

        // 重新组装Vue文件 - 使用位置信息进行精确替换
        let newContent = '';
        let lastIndex = 0;

        // 按位置顺序替换（template通常在前，script在后）
        const sections = [];

        if (templateStart !== -1 && templateEnd !== -1) {
          sections.push({ start: templateStart, end: templateEnd, replacement: `<template>${updatedTemplate}</template>`, type: 'template' });
        }

        if (scriptStart !== -1 && scriptEnd !== -1) {
          sections.push({ start: scriptStart, end: scriptEnd, replacement: updatedScript, type: 'script' });
        }

        // 按开始位置排序
        sections.sort((a, b) => a.start - b.start);

        // 执行替换
        sections.forEach(section => {
          newContent += content.substring(lastIndex, section.start);
          newContent += section.replacement;
          lastIndex = section.end;
        });

        // 添加剩余内容
        newContent += content.substring(lastIndex);

        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`已更新文件: ${filePath}`);
      } else {
        console.log(`没有匹配到中文: ${filePath}`);
      }
    }
  });
};

// 生成英文语言包
const generateEnglishTranslations = (chineseTranslations) => {
  const englishTranslations = {};
  Object.keys(chineseTranslations).forEach(key => {
    const chineseText = chineseTranslations[key];
    englishTranslations[key] = `[EN] ${chineseText}`;
  });
  return englishTranslations;
};

// 将对象转换为 JS 模块代码
const generateJsModule = (translations) => {
  const jsonString = JSON.stringify(translations, null, 2);
  return `export default ${jsonString};\n`;
};

// 从 JS 文件中读取翻译对象
const readJsModule = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // 移除 export default 和末尾分号
    const jsonString = content
      .replace(/^export\s+default\s+/, '')
      .replace(/;\s*$/, '')
      .trim();
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
};

// 创建备份分支
const createBackupBranch = () => {
  const { execSync } = require('child_process');

  try {
    // 生成带时间戳的分支名
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
    const branchName = `i18n-backup-${timestamp}`;

    // 创建备份分支（不切换）
    execSync(`git branch ${branchName}`, { stdio: 'ignore' });

    console.log(`\n📦 已创建备份分支: ${branchName}`);
    console.log(`   如需回滚，执行: git checkout ${branchName}\n`);

    return branchName;
  } catch (error) {
    console.warn('⚠️  创建备份分支失败（可能不在git仓库中），继续执行...\n');
    return null;
  }
};

// 主执行函数
try {
  const inputDir = path.resolve(__dirname, '../src/');
  const outputDir = path.resolve(__dirname, '../src/language');

  // 创建备份分支
  createBackupBranch();

  console.log(`输入目录: ${inputDir}`);
  console.log(`输出目录: ${outputDir}`);

  fs.mkdirSync(outputDir, { recursive: true });

  const translations = {};
  const zhTranslationsFilePath = path.join(outputDir, 'zh-CN.js');
  const enTranslationsFilePath = path.join(outputDir, 'en-US.js');

  console.log("中文语言包路径: ", zhTranslationsFilePath);
  console.log("英文语言包路径: ", enTranslationsFilePath);

  // 读取现有翻译
  if (fs.existsSync(zhTranslationsFilePath)) {
    const existing = readJsModule(zhTranslationsFilePath);
    if (existing) {
      Object.assign(translations, existing);
      console.log(`已加载现有中文翻译: ${Object.keys(existing).length} 条`);
    } else {
      console.warn("无法解析现有翻译文件，使用空翻译对象");
    }
  }

  processVueFiles(inputDir, outputDir, translations);

  const newKeysCount = Object.keys(translations).length - (fs.existsSync(zhTranslationsFilePath) ? Object.keys(readJsModule(zhTranslationsFilePath) || {}).length : 0);

  // 保存中文翻译为 JS 文件
  const zhJsContent = generateJsModule(translations);
  fs.writeFileSync(zhTranslationsFilePath, zhJsContent, 'utf-8');
  console.log(`中文语言包生成完成 (新增 ${newKeysCount} 条，总计 ${Object.keys(translations).length} 条)`);

  // 生成和保存英文翻译
  const englishTranslations = generateEnglishTranslations(translations);

  if (fs.existsSync(enTranslationsFilePath)) {
    const existingEnglish = readJsModule(enTranslationsFilePath);
    if (existingEnglish) {
      // 合并翻译，不覆盖已有的
      Object.keys(englishTranslations).forEach(key => {
        if (!existingEnglish[key]) {
          existingEnglish[key] = englishTranslations[key];
        }
      });
      const enJsContent = generateJsModule(existingEnglish);
      fs.writeFileSync(enTranslationsFilePath, enJsContent, 'utf-8');
      console.log(`英文语言包更新完成 (总计 ${Object.keys(existingEnglish).length} 条)`);
    } else {
      const enJsContent = generateJsModule(englishTranslations);
      fs.writeFileSync(enTranslationsFilePath, enJsContent, 'utf-8');
      console.log(`英文语言包生成完成 (${Object.keys(englishTranslations).length} 条)`);
    }
  } else {
    const enJsContent = generateJsModule(englishTranslations);
    fs.writeFileSync(enTranslationsFilePath, enJsContent, 'utf-8');
    console.log(`英文语言包生成完成 (${Object.keys(englishTranslations).length} 条)`);
  }

  console.log('\n🎉 I18N 处理完成!');
} catch (e) {
  console.error("语言包处理错误: ", e);
}