/**
 * NewDayPopup - Animated overlay announcing the start of a new in-game day.
 *
 * Shows the current day number and a "Daily allowance received!" badge.
 * Auto-dismisses after 4 seconds via CSS animation (0.5s fade-in, hold, 0.5s fade-out
 * starting at 3.5s). Clicking anywhere also dismisses it immediately.
 *
 * @prop {number} totalDaysPlayed - The day count to display.
 * @prop {() => void} onClose - Callback fired on click-to-dismiss.
 */
import React from "react";
import { Sun } from "lucide-react";

interface NewDayPopupProps {
  totalDaysPlayed: number;
  onClose: () => void;
}

const NewDayPopup: React.FC<NewDayPopupProps> = ({
  totalDaysPlayed,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer"
      onClick={onClose}
      style={{
        animation:
          "newDayFadeIn 0.5s ease-out, newDayFadeOut 0.5s ease-in 3.5s forwards",
      }}
    >
      <div
        className="bg-card rounded-2xl shadow-xl border border-border/60 overflow-hidden"
        style={{
          animation: "newDayPop 0.6s ease-out",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          maxWidth: "320px",
          width: "90vw",
        }}
      >
        <div className="bg-gradient-to-b from-amber-50 to-transparent px-10 py-8 flex flex-col items-center gap-5">
          <div
            className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center"
            style={{ animation: "newDaySunSpin 1s ease-out" }}
          >
            <Sun className="w-7 h-7 text-amber-500" />
          </div>
          <div className="text-center">
            <h2 className="font-serif font-bold text-xl text-foreground mb-1">
              A New Day Dawns!
            </h2>
            <p className="text-sm text-muted-foreground">
              Day{" "}
              <span className="font-mono font-bold text-amber-600">
                {totalDaysPlayed}
              </span>{" "}
              of your adventure
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-4 py-2 rounded-full">
            <span>{"💰"}</span>
            <span>Daily allowance received!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDayPopup;
