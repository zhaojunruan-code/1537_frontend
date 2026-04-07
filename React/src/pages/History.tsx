import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, PenTool, CheckSquare, FileText } from 'lucide-react';

export function History() {
  const navigate = useNavigate();
  const records = JSON.parse(localStorage.getItem('records') || '[]');

  return (
    <div className="min-h-full bg-gray-50 flex flex-col pb-20">
      <div className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center mr-8">历史记录</h1>
      </div>
      <div className="p-4 space-y-3">
        {records.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 flex flex-col items-center">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <p>暂无记录</p>
          </div>
        ) : (
          records.map((record: any) => (
            <div 
              key={record.id} 
              onClick={() => navigate(`/record/${record.id}`)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${record.type === 'write' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                {record.type === 'write' ? <PenTool className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-800 truncate pr-2">{record.title}</h3>
                  <span className="text-[10px] text-gray-400 shrink-0">{record.date}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{record.summary}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
