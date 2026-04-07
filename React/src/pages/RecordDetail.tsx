import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const records = JSON.parse(localStorage.getItem('records') || '[]');
  const record = records.find((r: any) => r.id === id);

  if (!record) {
    return (
      <div className="min-h-full bg-gray-50 flex flex-col">
        <div className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center mr-8">记录详情</h1>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">
          记录不存在或已被删除
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <div className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center mr-8">记录详情</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto pb-20">
        {record.type === 'write' ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-2">{record.title}</h2>
            <p className="text-xs text-gray-400 mb-4">{record.date}</p>
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-gray-800 text-gray-700">
              <ReactMarkdown>{record.result}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Score Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full opacity-50" />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-sm text-gray-500 font-medium">学生姓名</p>
                  <h2 className="text-xl font-bold text-gray-800 mt-1">{record.result?.studentName || '未知'}</h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium">最终得分</p>
                  <div className="flex items-baseline gap-1 text-orange-500">
                    <span className="text-4xl font-black">{record.result?.score || 0}</span>
                    <span className="text-sm font-bold">分</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  老师评语
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{record.result?.summary || record.summary || '暂无评语'}</p>
              </div>
            </div>

            {/* Annotations */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                逐句批改详情
              </h3>
              
              <div className="space-y-4">
                {record.result?.annotations?.map((ann: any, i: number) => {
                  const isHighlight = ann.type === 'highlight';
                  return (
                    <div key={i} className={`rounded-xl p-4 border ${isHighlight ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`mb-3 pb-3 border-b ${isHighlight ? 'border-blue-200/60' : 'border-gray-200/60'}`}>
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded mb-1 ${isHighlight ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                          {isHighlight ? '好句' : '原句'}
                        </span>
                        <p className="text-sm text-gray-700 font-medium">{ann.originalSentence}</p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {isHighlight ? (
                          <div className="flex gap-2 items-start">
                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded mt-0.5 shrink-0">点评</span>
                            <p className="text-xs text-gray-600 leading-relaxed">{ann.reason}</p>
                          </div>
                        ) : (
                          <>
                            {ann.issue && (
                              <div className="flex gap-2 items-start">
                                <span className="inline-block px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded mt-0.5 shrink-0">问题</span>
                                <p className="text-xs text-gray-600 leading-relaxed">{ann.issue}</p>
                              </div>
                            )}
                            {ann.suggestion && (
                              <div className="flex gap-2 items-start">
                                <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded mt-0.5 shrink-0">建议</span>
                                <p className="text-xs text-gray-600 leading-relaxed">{ann.suggestion}</p>
                              </div>
                            )}
                            {ann.correctedSentence && (
                              <div className="flex gap-2 items-start">
                                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded mt-0.5 shrink-0">修改</span>
                                <p className="text-xs text-gray-600 leading-relaxed font-medium">{ann.correctedSentence}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Model Essay */}
            {record.result?.modelEssay && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-purple-500" />
                  修改后范文
                </h3>
                <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {record.result.modelEssay}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
