import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Desktop POS</h1>
        <p className="text-slate-600 mb-8">Electron + React + Tailwind v4 + Mongoose</p>
        <button 
          onClick={() => setCount(c => c + 1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Count is {count}
        </button>
      </div>
    </div>
  );
}

export default App;
