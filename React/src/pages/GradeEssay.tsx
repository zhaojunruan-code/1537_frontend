import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { ChevronLeft, Camera, X, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { gradeEssay, GradingResult, GradingType } from '../services/ai';

export function GradeEssay() {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GradingResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState<number>(0);
  const [gradingType, setGradingType] = useState<GradingType>('chinese');
  const [gradingStandard, setGradingStandard] = useState<'gaokao' | 'custom'>('gaokao');
  const [customStandardText, setCustomStandardText] = useState('');

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGrade = async () => {
    if (images.length === 0) return;
    if (gradingStandard === 'custom' && !customStandardText.trim()) {
      alert('请输入自定义批改标准');
      return;
    }
    setLoading(true);
    setResults([]);
    setCurrentResultIndex(0);
    
    try {
      // Grade each image separately for batch grading
      const gradingPromises = images.map(img => gradeEssay('', [img], gradingType, gradingStandard, customStandardText));
      const res = await Promise.all(gradingPromises);
      setResults(res);
      
      // Save records
      const newRecords = res.map((r, idx) => ({
        id: Date.now().toString() + idx,
        type: 'grade',
        title: `批改：${r?.studentName || '未知'}的作文`,
        date: new Date().toLocaleDateString(),
        summary: `得分：${r?.score || 0}分。${(r?.summary || '').slice(0, 30)}...`,
        result: r
      }));
      const records = JSON.parse(localStorage.getItem('records') || '[]');
      localStorage.setItem('records', JSON.stringify([...newRecords, ...records]));
      
    } catch (error) {
      alert('批改失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const currentResult = results[currentResultIndex];

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <div className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center mr-8">AI 智能批改</h1>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {results.length === 0 ? (
          <>
            <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'chinese', label: '中文作文批改' },
                { id: 'english', label: '英语作文批改' },
                { id: 'english-continuation', label: '英语读后续写批改' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setGradingType(type.id as GradingType)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    gradingType === type.id
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-3">批改标准</h3>
              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => setGradingStandard('gaokao')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                    gradingStandard === 'gaokao'
                      ? 'bg-green-50 border-green-500 text-green-600'
                      : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  高考标准
                </button>
                <button
                  onClick={() => setGradingStandard('custom')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                    gradingStandard === 'custom'
                      ? 'bg-green-50 border-green-500 text-green-600'
                      : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  自定义标准
                </button>
              </div>
              
              {gradingStandard === 'custom' && (
                <textarea
                  value={customStandardText}
                  onChange={(e) => setCustomStandardText(e.target.value)}
                  placeholder="请输入您的自定义批改标准，例如：重点关注修辞手法的使用、字数要求800字以上、要求文风幽默等..."
                  className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:border-green-300 focus:ring-2 focus:ring-green-100 transition-all"
                />
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="w-full grid grid-cols-2 gap-3 mb-4">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <img src={img} alt="upload" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 backdrop-blur-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <div
                  {...getRootProps()}
                  className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input {...getInputProps()} />
                  <Camera className="w-8 h-8 mb-2 text-green-400" />
                  <span className="text-xs font-medium">拍照/上传作文</span>
                  <span className="text-[10px] mt-1 opacity-70">支持多张批量批改</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGrade}
              disabled={loading || images.length === 0}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors mt-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI 老师正在批改中...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>开始批量批改</span>
                </>
              )}
            </button>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Batch Report Card Summary */}
            {results.length > 1 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" />
                  批量批改成绩单 ({results.length}份)
                </h3>
                <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                  {results.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentResultIndex(idx)}
                      className={`flex-shrink-0 w-24 p-3 rounded-xl border transition-colors ${
                        currentResultIndex === idx 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-white hover:border-green-200'
                      }`}
                    >
                      <p className="text-xs text-gray-500 truncate">{res?.studentName || '未知'}</p>
                      <p className={`text-lg font-bold mt-1 ${currentResultIndex === idx ? 'text-green-500' : 'text-gray-800'}`}>
                        {res?.score || 0}分
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Score Card */}
            {currentResult && (
              <>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full opacity-50" />
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">学生姓名</p>
                      <h2 className="text-xl font-bold text-gray-800 mt-1">{currentResult?.studentName || '未知'}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 font-medium">最终得分</p>
                      <div className="flex items-baseline gap-1 text-green-500">
                        <span className="text-4xl font-black">{currentResult?.score || 0}</span>
                        <span className="text-sm font-bold">分</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      老师评语
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{currentResult?.summary || '暂无评语'}</p>
                  </div>
                </div>

                {/* Annotations */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-green-500" />
                    逐句批改详情
                  </h3>
                  
                  <div className="space-y-4">
                    {currentResult?.annotations?.map((ann, i) => {
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
                                    <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-bold rounded mt-0.5 shrink-0">建议</span>
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
                {currentResult?.modelEssay && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-500" />
                      修改后范文
                    </h3>
                    <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {currentResult.modelEssay}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => {
                setResults([]);
                setImages([]);
              }}
              className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors"
            >
              继续批改下一批
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
