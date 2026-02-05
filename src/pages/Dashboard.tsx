import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import { supabase } from '@/lib/supabase';
import GameDashboard from '@/components/GameDashboard';
import PetCreationWizard from '@/components/PetCreationWizard';
import { toast } from '@/hooks/use-toast';
import { GameState } from '@/types/game';

/** Minimal validation that save data has the expected shape */
function isValidSaveData(data: unknown): data is GameState {
  if (typeof data !== 'object' || data === null) return false;
  const save = data as Record<string, unknown>;
  return (
    typeof save.gameStarted === 'boolean' &&
    typeof save.money === 'number' &&
    Array.isArray(save.transactions) &&
    Array.isArray(save.achievements)
  );
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { state, loadGameFromCloud } = useGame();
  const [loadingCloudSave, setLoadingCloudSave] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadCloudSave = async () => {
      try {
        // First check if profile exists (use maybeSingle to avoid 406 error when no rows)
        const { error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          setLoadError('Failed to load profile. Please try refreshing the page.');
          toast({
            title: 'Error loading profile',
            description: 'There was a problem loading your profile. Please try again.',
            variant: 'destructive',
          });
          setLoadingCloudSave(false);
          return;
        }

        const { data, error } = await supabase
          .from('game_saves')
          .select('save_data')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          setLoadError('Failed to load saved game. Starting fresh.');
          toast({
            title: 'Could not load saved game',
            description: 'We had trouble loading your saved game. You can start a new game.',
            variant: 'destructive',
          });
        } else if (data?.save_data) {
          if (isValidSaveData(data.save_data)) {
            loadGameFromCloud(data.save_data);
          } else {
            console.error('Invalid save data shape, starting fresh');
            toast({
              title: 'Save data corrupted',
              description: 'Your saved game data was invalid. Starting fresh.',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        setLoadError('An unexpected error occurred. Please try again.');
        toast({
          title: 'Connection error',
          description: 'Failed to connect to the server. Please check your internet connection.',
          variant: 'destructive',
        });
      } finally {
        setLoadingCloudSave(false);
      }
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

  if (loadError && !state.gameStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center paper-texture w-full overflow-x-hidden gap-4">
        <div className="text-muted-foreground text-lg">{loadError}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (state.gameStarted && state.pet) {
    return <GameDashboard />;
  }

  return <PetCreationWizard />;
};

export default Dashboard;
