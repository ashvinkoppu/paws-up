import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import { supabase } from '@/lib/supabase';
import GameDashboard from '@/components/GameDashboard';
import PetCreationWizard from '@/components/PetCreationWizard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { state, loadGameFromCloud } = useGame();
  const [loadingCloudSave, setLoadingCloudSave] = useState(true);
  const [hasCloudSave, setHasCloudSave] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadCloudSave = async () => {
      console.log('[Dashboard] Loading cloud save for user:', user.id);

      // First check if profile exists (use maybeSingle to avoid 406 error when no rows)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      console.log('[Dashboard] Profile check:', { profile, profileError });

      const { data, error } = await supabase
        .from('game_saves')
        .select('save_data')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('[Dashboard] Game save load result:', {
        hasData: !!data,
        hasSaveData: !!data?.save_data,
        hasPet: !!data?.save_data?.pet,
        gameStarted: data?.save_data?.gameStarted,
        error
      });

      if (data?.save_data) {
        console.log('[Dashboard] Calling loadGameFromCloud with pet:', data.save_data.pet?.name);
        loadGameFromCloud(data.save_data);
        setHasCloudSave(true);
      }
      setLoadingCloudSave(false);
    };

    loadCloudSave();
  }, [user, loadGameFromCloud]);

  if (loadingCloudSave) {
    return (
      <div className="min-h-screen flex items-center justify-center paper-texture w-full overflow-x-hidden">
        <div className="animate-pulse text-muted-foreground text-lg">Loading your adventure...</div>
      </div>
    );
  }

  if (state.gameStarted && state.pet) {
    return <GameDashboard />;
  }

  return <PetCreationWizard onComplete={() => {}} />;
};

export default Dashboard;
