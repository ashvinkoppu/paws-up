import React from "react";
import { useGame } from "@/context/GameContext";
import { Navigate } from "react-router-dom";
import ParkPlayground from "@/components/park/ParkPlayground";

const Park: React.FC = () => {
  const { state } = useGame();

  if (!state.gameStarted || !state.pet) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ParkPlayground />;
};

export default Park;
