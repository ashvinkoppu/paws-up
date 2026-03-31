/**
 * Dashboard - Top-level page component for the main game experience.
 *
 * On mount it fetches the authenticated user's cloud save from the
 * Supabase `game_saves` table, validates its shape with {@link isValidSaveData},
 * and hydrates the game context via `loadGameFromCloud`. While the save is
 * loading a pulsing placeholder is shown; on error the user sees a retry prompt.
 *
 * After loading, the component conditionally renders:
 *  - {@link GameDashboard} when a game is already in progress (pet exists).
 *  - {@link PetCreationWizard} when the player needs to create their first pet.
 *
 * @module pages/Dashboard
 */
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { supabase } from "@/lib/supabase";
import GameDashboard from "@/components/dashboard/GameDashboard";
import PetCreationWizard from "@/components/pet/PetCreationWizard";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { GameState } from "@/types/game";
import { PawPrint, RotateCcw } from "lucide-react";

/** Minimal validation that save data has the expected shape */
function isValidSaveData(data: unknown): data is GameState {
  if (typeof data !== "object" || data === null) return false;
  const save = data as Record<string, unknown>;
  return (
    typeof save.gameStarted === "boolean" &&
    typeof save.money === "number" &&
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
    if (!user) {
      setLoadingCloudSave(false);
      return;
    }

    const loadCloudSave = async () => {
      try {
        // First check if profile exists (use maybeSingle to avoid 406 error when no rows)
        const { error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          setLoadError(
            "Failed to load profile. Please try refreshing the page.",
          );
          toast({
            title: "Error loading profile",
            description:
              "There was a problem loading your profile. Please try again.",
            variant: "destructive",
          });
          setLoadingCloudSave(false);
          return;
        }

        const { data, error } = await supabase
          .from("game_saves")
          .select("save_data")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          setLoadError("Failed to load saved game. Starting fresh.");
          toast({
            title: "Could not load saved game",
            description:
              "We had trouble loading your saved game. You can start a new game.",
            variant: "destructive",
          });
        } else if (data?.save_data) {
          if (isValidSaveData(data.save_data)) {
            loadGameFromCloud(data.save_data);
          } else {
            console.error("Invalid save data shape, starting fresh");
            toast({
              title: "Save data corrupted",
              description: "Your saved game data was invalid. Starting fresh.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        setLoadError("An unexpected error occurred. Please try again.");
        toast({
          title: "Connection error",
          description:
            "Failed to connect to the server. Please check your internet connection.",
          variant: "destructive",
        });
      } finally {
        setLoadingCloudSave(false);
      }
    };

    loadCloudSave();
  }, [user, loadGameFromCloud]);

  if (loadingCloudSave) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <PawPrint className="w-6 h-6 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm">Loading your adventure…</p>
      </div>
    );
  }

  if (loadError && !state.gameStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <RotateCcw className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-muted-foreground max-w-xs">{loadError}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="rounded-xl gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </Button>
      </div>
    );
  }

  if (state.gameStarted && state.pet) {
    return <GameDashboard />;
  }

  return <PetCreationWizard />;
};

export default Dashboard;
