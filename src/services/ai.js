const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

function buildGeminiUrl(model) {
  return `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`
}

function imageToInlinePart(base64DataUrl) {
  const [header, data] = base64DataUrl.split(',')
  const mimeType = header.split(':')[1].split(';')[0]
  return {
    inlineData: { data, mimeType }
  }
}

function geminiRequest(url, body) {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: body,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          console.error('Gemini API error', res)
          reject(new Error(`API请求失败: ${res.statusCode}`))
        }
      },
      fail(err) {
        console.error('Gemini request failed', err)
        reject(new Error('网络错误'))
      }
    })
  })
}

export async function generateEssay(promptText, images) {
  const parts = []
  if (promptText) {
    parts.push({ text: `请根据以下要求写一篇作文：\n${promptText}` })
  }
  for (const img of images) {
    parts.push(imageToInlinePart(img))
  }

  const body = {
    contents: [{ parts }],
    systemInstruction: {
      parts: [{ text: '你是一个专业的语文老师和优秀的作家。请根据用户的要求和提供的图片素材，写出一篇高质量的中文作文。注意文笔优美，逻辑清晰，符合题目要求。' }]
    }
  }

  const data = await geminiRequest(buildGeminiUrl(GEMINI_MODEL), body)
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return text
}

export async function gradeEssay(promptText, images, type = 'chinese', standard = 'gaokao', customStandardText = '') {
  const parts = []
  if (promptText) {
    parts.push({ text: `请批改以下作文：\n${promptText}` })
  }
  for (const img of images) {
    parts.push(imageToInlinePart(img))
  }

  let baseInstruction = type === 'chinese'
    ? '你是一个严格且专业的语文老师。你的任务是批改学生提交的中文作文（可能是文字或图片）。\n1. 尝试从作文中识别学生的姓名（如果没有则返回"未知"）。\n2. 给出总分（百分制）。\n3. 给出总体评价。\n4. 逐句批改：对于有问题的句子，指出问题点，给出修改建议，并提供修改后的具体句子；对于写得好的句子，也要标注出来，并说明好在哪里。\n5. 最后，请根据原意和题目要求，提供一篇高质量的修改后范文（modelEssay）。'
    : type === 'english'
    ? '你是一个严格且专业的英语老师。你的任务是批改学生提交的英语作文（可能是文字或图片）。\n1. 尝试从作文中识别学生的姓名（如果没有则返回"未知"）。\n2. 给出总分（百分制）。\n3. 给出总体评价。\n4. 逐句批改：对于有问题的句子，指出语法/拼写/用词错误，给出修改建议，并提供修改后的具体句子；对于写得好的句子，也要标注出来，并说明好在哪里。\n5. 最后，请根据原意和题目要求，提供一篇高质量的修改后范文（modelEssay）。'
    : '你是一个严格且专业的英语老师。你的任务是批改学生提交的英语读后续写（可能是文字或图片）。\n1. 尝试从作文中识别学生的姓名（如果没有则返回"未知"）。\n2. 给出总分（百分制）。\n3. 给出总体评价（重点关注与前文的衔接、情节发展的合理性）。\n4. 逐句批改：对于有问题的句子，指出语言错误，给出修改建议，并提供修改后的具体句子；对于写得好的句子，也要标注出来，并说明好在哪里。\n5. 最后，请根据原意和题目要求，提供一篇高质量的修改后范文（modelEssay）。'

  if (standard === 'gaokao') {
    baseInstruction += '\n\n请严格按照中国高考作文评分标准进行批改。'
  } else if (standard === 'custom' && customStandardText) {
    baseInstruction += `\n\n请严格按照以下自定义标准进行批改：\n${customStandardText}`
  }

  const jsonSchema = `请严格按照以下JSON格式返回结果（不要包含markdown代码块标记）：
{
  "studentName": "学生姓名，未识别到则填未知",
  "score": 85,
  "summary": "总体评价和总结",
  "modelEssay": "根据学生作文修改后的高质量范文",
  "annotations": [
    {
      "type": "issue或highlight",
      "originalSentence": "原句",
      "issue": "存在的问题（仅当type为issue时填写）",
      "suggestion": "修改建议（仅当type为issue时填写）",
      "correctedSentence": "修改后的句子（仅当type为issue时填写）",
      "reason": "好在哪里（仅当type为highlight时填写）"
    }
  ]
}`

  parts.push({ text: jsonSchema })

  const body = {
    contents: [{ parts }],
    systemInstruction: {
      parts: [{ text: baseInstruction }]
    },
    generationConfig: {
      responseMimeType: 'application/json'
    }
  }

  const data = await geminiRequest(buildGeminiUrl(GEMINI_MODEL), body)
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

  try {
    return JSON.parse(text)
  } catch (e) {
    console.error('Failed to parse grading result', e, text)
    throw new Error('批改结果解析失败')
  }
}
