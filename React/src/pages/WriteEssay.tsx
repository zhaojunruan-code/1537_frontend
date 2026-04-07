import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { ChevronLeft, Image as ImageIcon, X, Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateEssay } from '../services/ai';
import ReactMarkdown from 'react-markdown';

export function WriteEssay() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

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

  const handleSubmit = async () => {
    if (!prompt && images.length === 0) return;
    setLoading(true);
    setResult('');
    try {
      const res = await generateEssay(prompt, images);
      setResult(res);
      
      // Save record
      const newRecord = {
        id: Date.now().toString(),
        type: 'write',
        title: prompt ? `写作：${prompt.slice(0, 10)}...` : '看图写作',
        date: new Date().toLocaleDateString(),
        summary: res.slice(0, 50) + '...',
        result: res
      };
      const records = JSON.parse(localStorage.getItem('records') || '[]');
      localStorage.setItem('records', JSON.stringify([newRecord, ...records]));
      
    } catch (error) {
      alert('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <div className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center mr-8">AI 帮写作文</h1>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {!result ? (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="请输入作文题目、要求或大纲..."
                className="w-full h-32 resize-none outline-none text-gray-700 placeholder-gray-400"
              />
              
              <div className="mt-4 flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={img} alt="upload" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <div
                  {...getRootProps()}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50"
                >
                  <input {...getInputProps()} />
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">添加图片</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || (!prompt && images.length === 0)}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors mt-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI 正在构思中...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>开始生成</span>
                </>
              )}
            </button>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-gray-800 text-gray-700">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
            <button
              onClick={() => setResult('')}
              className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors"
            >
              重新生成
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
