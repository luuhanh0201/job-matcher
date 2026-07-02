"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

interface SlideUpProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  distance?: number;
}

export function SlideUp({
  delay = 0,
  duration = 0.4,
  distance = 16,
  ...props
}: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    />
  );
}
