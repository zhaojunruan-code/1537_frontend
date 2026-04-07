import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, FileText, ChevronRight, LogOut, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const records = JSON.parse(localStorage.getItem('records') || '[]');
  
  const gradeCount = records.filter((r: any) => r.type === 'grade').length;
  const writeCount = records.filter((r: any) => r.type === 'write').length;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="bg-gray-50 min-h-full pb-24">
      <div className="bg-green-600 px-6 pt-12 pb-20 rounded-b-[40px] shadow-md relative">
        <div className="flex items-center gap-4 text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {user.name || '未登录'}
              {user.isVip && <Crown className="w-4 h-4 text-yellow-300" />}
            </h1>
            <p className="text-green-100 text-xs mt-1">
              {user.isVip ? 'VIP会员' : '普通用户'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-12 relative z-10 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">我的数据</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-gray-800">{gradeCount}</p>
              <p className="text-xs text-gray-500 mt-1">批改次数</p>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{writeCount}</p>
              <p className="text-xs text-gray-500 mt-1">帮写次数</p>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{gradeCount}</p>
              <p className="text-xs text-gray-500 mt-1">生成成绩单</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <MenuItem icon={FileText} label="历史记录" onClick={() => navigate('/history')} />
          <div className="h-px bg-gray-100 mx-4" />
          <MenuItem icon={LogOut} label="退出登录" onClick={handleLogout} textClass="text-red-500" />
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, textClass = "text-gray-700" }: any) {
  return (
    <motion.button
      whileTap={{ backgroundColor: '#f9fafb' }}
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${textClass}`} />
        <span className={`text-sm font-medium ${textClass}`}>{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </motion.button>
  );
}
