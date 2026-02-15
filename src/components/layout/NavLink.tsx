/**
 * @file NavLink.tsx
 *
 * A wrapper around React Router's NavLink that simplifies the className API.
 * React Router v6 changed NavLink's `className` to a render-prop function,
 * which makes it awkward to use with plain string class names. This component
 * restores a simpler interface: pass `className` for the base styles,
 * `activeClassName` for active-state styles, and `pendingClassName` for
 * pending-state styles. Classes are merged via the `cn` utility (clsx + twMerge).
 *
 * Wrapped with `forwardRef` so parent components can attach refs to the
 * underlying anchor element.
 */
import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Override React Router's render-prop `className` with plain strings.
 * The original `className` is omitted so we can accept a simple string instead.
 */
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        // Convert our flat string props back into Router's render-prop API,
        // conditionally merging active/pending classes via cn().
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
