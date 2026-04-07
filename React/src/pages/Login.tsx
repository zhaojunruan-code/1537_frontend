import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Mock login
    localStorage.setItem('user', JSON.stringify({ name: '微信用户', isVip: false }));
    navigate('/');
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col items-center justify-center p-6 relative shadow-xl">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-16"
        >
          <div className="w-24 h-24 bg-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <MessageCircle className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">AI作文助手</h1>
          <p className="text-gray-500 mt-2 text-sm">智能批改，轻松写作</p>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onClick={handleLogin}
          className="w-full max-w-xs bg-[#07C160] hover:bg-[#06ad56] text-white font-medium py-3.5 px-4 rounded-full flex items-center justify-center gap-2 transition-colors shadow-md"
        >
          <MessageCircle className="w-5 h-5" />
          <span>微信一键登录</span>
        </motion.button>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-gray-400 mt-8 text-center"
        >
          登录即代表同意《用户协议》和《隐私政策》
        </motion.p>
      </div>
    </div>
  );
}
