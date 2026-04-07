import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateEssay(promptText: string, images: string[]): Promise<string> {
  const parts: any[] = [];
  if (promptText) {
    parts.push({ text: `请根据以下要求写一篇作文：\n${promptText}` });
  }
  for (const img of images) {
    const [header, data] = img.split(',');
    const mimeType = header.split(':')[1].split(';')[0];
    parts.push({
      inlineData: {
        data,
        mimeType,
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction: "你是一个专业的语文老师和优秀的作家。请根据用户的要求和提供的图片素材，写出一篇高质量的中文作文。注意文笔优美，逻辑清晰，符合题目要求。",
    }
  });

  return response.text || "";
}

export interface GradingResult {
  studentName: string;
  score: number;
  summary: string;
  modelEssay?: string;
  annotations: {
    type?: 'issue' | 'highlight';
    originalSentence: string;
    issue?: string;
    suggestion?: string;
    correctedSentence?: string;
    reason?: string;
  }[];
}

export type GradingType = 'chinese' | 'english' | 'english-continuation';

export async function gradeEssay(
  promptText: string, 
  images: string[], 
  type: GradingType = 'chinese',
  standard: 'gaokao' | 'custom' = 'gaokao',
  customStandardText: string = ''
): Promise<GradingResult> {
  const parts: any[] = [];
  if (promptText) {
    parts.push({ text: `请批改以下作文：\n${promptText}` });
  }
  for (const img of images) {
    const [header, data] = img.split(',');
    const mimeType = header.split(':')[1].split(';')[0];
    parts.push({
      inlineData: {
        data,
        mimeType,
      }
    });
  }

  let baseInstruction = type === 'chinese' 
    ? "你是一个严格且专业的语文老师。你的任务是批改学生提交的中文作文（可能是文字或图片）。\n1. 尝试从作文中识别学生的姓名（如果没有则返回'未知'）。\n2. 给出总分（百分制）。\n3. 给出总体评价。\n4. 逐句批改：对于有问题的句子，指出问题点，给出修改建议，并提供修改后的具体句子；对于写得好的句子，也要标注出来，并说明好在哪里。\n5. 最后，请根据原意和题目要求，提供一篇高质量的修改后范文（modelEssay）。"
    : type === 'english'
    ? "你是一个严格且专业的英语老师。你的任务是批改学生提交的英语作文（可能是文字或图片）。\n1. 尝试从作文中识别学生的姓名（如果没有则返回'未知'）。\n2. 给出总分（百分制）。\n3. 给出总体评价。\n4. 逐句批改：对于有问题的句子，指出语法/拼写/用词错误，给出修改建议，并提供修改后的具体句子；对于写得好的句子，也要标注出来，并说明好在哪里。\n5. 最后，请根据原意和题目要求，提供一篇高质量的修改后范文（modelEssay）。"
    : "你是一个严格且专业的英语老师。你的任务是批改学生提交的英语读后续写（可能是文字或图片）。\n1. 尝试从作文中识别学生的姓名（如果没有则返回'未知'）。\n2. 给出总分（百分制）。\n3. 给出总体评价（重点关注与前文的衔接、情节发展的合理性）。\n4. 逐句批改：对于有问题的句子，指出语言错误，给出修改建议，并提供修改后的具体句子；对于写得好的句子，也要标注出来，并说明好在哪里。\n5. 最后，请根据原意和题目要求，提供一篇高质量的修改后范文（modelEssay）。";

  if (standard === 'gaokao') {
    baseInstruction += "\n\n请严格按照中国高考作文评分标准进行批改。";
  } else if (standard === 'custom' && customStandardText) {
    baseInstruction += `\n\n请严格按照以下自定义标准进行批改：\n${customStandardText}`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction: baseInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          studentName: { type: Type.STRING, description: "学生姓名，未识别到则填'未知'" },
          score: { type: Type.NUMBER, description: "作文得分，0-100" },
          summary: { type: Type.STRING, description: "总体评价和总结" },
          modelEssay: { type: Type.STRING, description: "根据学生作文修改后的高质量范文" },
          annotations: {
            type: Type.ARRAY,
            description: "逐句批改和标注，包括问题句和优秀句",
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "标注类型：'issue'表示有问题需要修改，'highlight'表示写得好的句子" },
                originalSentence: { type: Type.STRING, description: "原句" },
                issue: { type: Type.STRING, description: "存在的问题（仅当type为'issue'时填写）" },
                suggestion: { type: Type.STRING, description: "修改建议或思路（仅当type为'issue'时填写）" },
                correctedSentence: { type: Type.STRING, description: "修改后的具体句子（仅当type为'issue'时填写）" },
                reason: { type: Type.STRING, description: "好在哪里（仅当type为'highlight'时填写）" }
              },
              required: ["type", "originalSentence"]
            }
          }
        },
        required: ["studentName", "score", "summary", "modelEssay", "annotations"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as GradingResult;
  } catch (e) {
    console.error("Failed to parse grading result", e);
    throw new Error("批改结果解析失败");
  }
}
