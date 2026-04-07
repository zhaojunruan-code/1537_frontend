import React, { useState } from 'react';
import { Crown, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function Recharge() {
  const [selected, setSelected] = useState(1);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const plans = [
    { id: 1, name: '连续包月', price: '19', original: '29', desc: '首月特惠，自动续费' },
    { id: 2, name: '季度会员', price: '58', original: '88', desc: '低至19.3元/月' },
    { id: 3, name: '年度会员', price: '198', original: '348', desc: '低至16.5元/月，最划算' },
  ];

  const handlePay = () => {
    alert('模拟支付成功！您已成为VIP会员。');
    localStorage.setItem('user', JSON.stringify({ ...user, isVip: true }));
    window.location.reload();
  };

  return (
    <div className="bg-gray-50 min-h-full pb-24">
      <div className="bg-[#2C2C2C] px-6 pt-12 pb-20 rounded-b-[40px] shadow-md relative">
        <div className="flex items-center gap-4 text-white">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center p-1">
            <div className="w-full h-full bg-[#2C2C2C] rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-yellow-400">{user.name || '同学'}</h1>
            <p className="text-gray-400 text-xs mt-1">
              {user.isVip ? '尊贵的VIP会员，您好！' : '开通VIP，畅享无限次智能批改'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">选择会员套餐</h2>
          
          <div className="grid gap-3">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(plan.id)}
                className={`relative border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                  selected === plan.id
                    ? 'border-yellow-500 bg-yellow-50/50'
                    : 'border-gray-100 bg-white hover:border-yellow-200'
                }`}
              >
                {selected === plan.id && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                    已选
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800">{plan.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1 text-yellow-600 justify-end">
                      <span className="text-sm">¥</span>
                      <span className="text-2xl font-black">{plan.price}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 line-through">¥{plan.original}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-800 mb-3">VIP特权</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-600">无限次AI批改</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-600">无限次AI帮写</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-600">专属成绩单导出</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-600">优先极速响应</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePay}
            className="w-full mt-8 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold py-3.5 rounded-full shadow-lg shadow-yellow-500/30 transition-all"
          >
            立即开通
          </button>
        </div>
      </div>
    </div>
  );
}
