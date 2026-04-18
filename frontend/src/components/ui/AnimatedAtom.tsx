"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface AnimatedAtomHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface AnimatedAtomProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const PATH_1_VARIANTS: Variants = {
  initial: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [1.7, 0],
    transition: {
      duration: 0.7,
      ease: "easeIn",
    },
  },
};

const PATH_2_VARIANTS: Variants = {
  initial: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [1.5, 0],
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const AnimatedAtom = forwardRef<AnimatedAtomHandle, AnimatedAtomProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("initial"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("initial");
        }
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle r="1" cx="12" cy="12" />
          <motion.path
            d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"
            pathLength={1}
            variants={PATH_1_VARIANTS}
            animate={controls}
            initial="initial"
          />
          <motion.path
            d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"
            pathLength={1}
            variants={PATH_2_VARIANTS}
            animate={controls}
            initial="initial"
          />
        </svg>
      </div>
    );
  }
);

AnimatedAtom.displayName = "AnimatedAtom";

export { AnimatedAtom };
