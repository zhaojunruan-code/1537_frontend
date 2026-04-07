import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PenTool, CheckSquare, FileText, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const records = JSON.parse(localStorage.getItem('records') || '[]');
  const recentRecords = records.slice(0, 3);

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-green-600 px-6 pt-12 pb-16 rounded-b-[40px] shadow-md relative">
        <div className="flex justify-between items-center text-white">
          <div>
            <h1 className="text-2xl font-bold">你好，{user.name || '同学'}</h1>
            <p className="text-green-100 text-sm mt-1">今天想写点什么呢？</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8 relative z-10 space-y-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/grade')}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer"
        >
          <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">AI 智能批改</h2>
            <p className="text-sm text-gray-500 mt-1">中文作文批改，英语作文批改，英语读后续写批改</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/write')}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer"
        >
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <PenTool className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">AI 帮写作文</h2>
            <p className="text-sm text-gray-500 mt-1">输入要求或上传图片，AI帮你构思写作</p>
          </div>
        </motion.div>
      </div>

      <div className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">最近记录</h3>
          <button onClick={() => navigate('/history')} className="text-sm text-gray-400">查看全部</button>
        </div>
        
        {recentRecords.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-center h-32">
            <div className="text-center text-gray-400 flex flex-col items-center">
              <FileText className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-sm">暂无记录</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((record: any) => (
              <div 
                key={record.id} 
                onClick={() => navigate(`/record/${record.id}`)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${record.type === 'write' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                  {record.type === 'write' ? <PenTool className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800 text-sm truncate pr-2">{record.title}</h3>
                    <span className="text-[10px] text-gray-400 shrink-0">{record.date}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{record.summary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
