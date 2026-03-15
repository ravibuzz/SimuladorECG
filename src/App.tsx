import { useState } from 'react';
import Tutorial from './components/Tutorial';
import Simulator from './components/Simulator';

export default function App() {
  const [appMode, setAppMode] = useState<'tutorial' | 'simulator'>('tutorial');

  if (appMode === 'tutorial') {
    return <Tutorial onComplete={() => setAppMode('simulator')} />;
  }

  return <Simulator onBackToTutorial={() => setAppMode('tutorial')} />;
}
