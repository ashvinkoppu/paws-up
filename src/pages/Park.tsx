import React from 'react';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import ParkPlayground from '@/components/park/ParkPlayground';

const Park: React.FC = () => {
  const { state } = useGame();
  const navigate = useNavigate();

  if (!state.gameStarted || !state.pet) {
    navigate('/dashboard');
    return null;
  }

  return <ParkPlayground />;
};

export default Park;
