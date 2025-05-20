import { useState } from 'react';
import PornEffectsComponent from './components/PornEffectsComponent';


const App = () => {
  const [activeTab, setActiveTab] = useState('planner');

  return (
    <><PornEffectsComponent/></>
  );
};

export default App;