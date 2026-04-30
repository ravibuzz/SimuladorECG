import { useState } from 'react';
import Tutorial from './components/Tutorial';
import Simulator from './components/Simulator';
import ECGAnalyzer from './components/ECGAnalyzer';

export default function App() {
  const [appMode, setAppMode] = useState<'tutorial' | 'simulator' | 'analyzer'>('tutorial');

  if (appMode === 'tutorial') {
    return <Tutorial onComplete={() => setAppMode('simulator')} />;
  }

  if (appMode === 'analyzer') {
    return <ECGAnalyzer onBack={() => setAppMode('simulator')} />;
  }

  return <Simulator onBackToTutorial={() => setAppMode('tutorial')} onNavigateToAnalyzer={() => setAppMode('analyzer')} />;
}
