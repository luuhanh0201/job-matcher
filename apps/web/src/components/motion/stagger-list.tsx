"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

interface StaggerListProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number;
}

const containerVariants = (staggerDelay: number): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: staggerDelay },
  },
});

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// Bọc quanh danh sách card/item: mỗi StaggerItem con sẽ lần lượt xuất hiện
// cách nhau `staggerDelay` giây khi StaggerList vào viewport.
export function StaggerList({ staggerDelay = 0.08, ...props }: StaggerListProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants(staggerDelay)}
      {...props}
    />
  );
}

export function StaggerItem(props: HTMLMotionProps<"div">) {
  return <motion.div variants={itemVariants} {...props} />;
}
