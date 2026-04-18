"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface AnimatedScrollTextHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface AnimatedScrollTextProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const PATH_1_VARIANTS: Variants = {
  initial: { x: 0, y: 0, opacity: 1 },
  animate: {
    x: [1, 0],
    y: [-5, 0],
    opacity: [0, 1],
    transition: { duration: 0.3, ease: "easeOut", delay: 0.5 },
  },
};

const PATH_2_VARIANTS: Variants = {
  initial: { x: 0, y: 0, opacity: 1 },
  animate: {
    x: [-2, 0],
    y: [-6, 0],
    opacity: [0, 1],
    transition: { duration: 0.3, ease: "easeOut", delay: 0.5 },
  },
};

const PATH_3_VARIANTS: Variants = {
  initial: { x: 0, y: 0, pathLength: 1, pathOffset: 0 },
  animate: {
    x: [-3, -3, -2, 0],
    y: [-13, 0],
    pathLength: [0.35, 0.35, 0.4, 1],
    transition: { duration: 0.7, ease: "circInOut", delay: 0.1 },
  },
};

const PATH_4_VARIANTS: Variants = {
  initial: { opacity: 1, pathLength: 1, pathOffset: 0 },
  animate: {
    opacity: [0, 1, 1],
    pathLength: [0, 1],
    transition: { duration: 0.8, ease: "circInOut", delay: 0.1 },
  },
};

const PATH_5_VARIANTS: Variants = {
  initial: { opacity: 1, pathLength: 1, pathOffset: 0 },
  animate: {
    opacity: [0, 1, 1],
    pathLength: [0, 1],
    pathOffset: [1, 0],
    transition: { duration: 0.6, ease: "circInOut", delay: 0.1 },
  },
};

const AnimatedScrollText = forwardRef<AnimatedScrollTextHandle, AnimatedScrollTextProps>(
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
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M15 12H10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={PATH_1_VARIANTS}
            animate={controls}
            initial="initial"
          />
          <motion.path
            d="M15 8H10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={PATH_2_VARIANTS}
            animate={controls}
            initial="initial"
          />
          <motion.path
            d="M21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H8C8.53043 21 9.03914 20.7893 9.41421 20.4142C9.78929 20.0391 10 19.5304 10 19V18C10 17.7348 10.1054 17.4804 10.2929 17.2929C10.4804 17.1054 10.7348 17 11 17H21C21.2652 17 21.5196 17.1054 21.7071 17.2929C21.8946 17.4804 22 17.7348 22 18V19C22 19.5304 21.7893 20.0391 21.4142 20.4142Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            variants={PATH_3_VARIANTS}
            animate={controls}
            initial="initial"
          />
          <motion.path
            d="M6 8.13745V19C6 19.5305 6.21071 20.0392 6.58579 20.4143C6.96086 20.7893 7.46957 21 8 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            variants={PATH_4_VARIANTS}
            animate={controls}
            initial="initial"
          />
          <motion.path
            d="M19 17V6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            variants={PATH_5_VARIANTS}
            animate={controls}
            initial="initial"
          />
          <path
            d="M4 3C4.53043 3 5.03914 3.21071 5.41421 3.58579C5.78929 3.96086 6 4.46957 6 5V8H3C2.73478 8 2.48043 7.89464 2.29289 7.70711C2.10536 7.51957 2 7.26522 2 7V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3ZM4 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
);

AnimatedScrollText.displayName = "AnimatedScrollText";

export { AnimatedScrollText };
