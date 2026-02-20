import React, { useState } from 'react';
import './styles/App.css';

const App: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Android File Transfer</h1>
        <p>Electron + React + TypeScript</p>
        <button onClick={() => setCount((c) => c + 1)}>
          Count: {count}
        </button>
      </header>
    </div>
  );
};

export default App;
