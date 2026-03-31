/**
 * AnimatedSection — fade + slide entrance animation driven by IntersectionObserver.
 *
 * Used on public marketing pages to animate content as the user scrolls.
 * The animation fires once and never reverses.
 */
import React from "react";
import { useInView } from "@/hooks/use-scroll-state";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in seconds */
  delay?: number;
  /** Slide direction — "up" by default */
  direction?: "up" | "left" | "right";
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
}) => {
  const [ref, inView] = useInView();

  const transforms: Record<"up" | "left" | "right", string> = {
    up: inView ? "translateY(0px)" : "translateY(40px)",
    left: inView ? "translateX(0px)" : "translateX(-40px)",
    right: inView ? "translateX(0px)" : "translateX(40px)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: transforms[direction],
        transition: `opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.75s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
