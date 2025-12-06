// src/components/layout/AnimatedHamburgerIcon.tsx
"use client";
import { motion } from "framer-motion";

interface AnimatedHamburgerIconProps {
  isOpen: boolean;
}

const topVariants = {
  closed: { rotate: 0, translateY: 0 },
  open: { rotate: 45, translateY: 7 }, // Adjusted for a 16px height
};

const middleVariants = {
  closed: { opacity: 1 },
  open: { opacity: 0 },
};

const bottomVariants = {
  closed: { rotate: 0, translateY: 0 },
  open: { rotate: -45, translateY: -7 }, // Adjusted for a 16px height
};

export function AnimatedHamburgerIcon({ isOpen }: AnimatedHamburgerIconProps) {
  const variant = isOpen ? "open" : "closed";

  return (
    <div className="relative h-4 w-5">
      <motion.span
        className="absolute block h-0.5 w-full bg-current" // bg-current inherits text color
        style={{ top: 0 }}
        variants={topVariants}
        animate={variant}
        transition={{ duration: 0.3 }}
      />
      <motion.span
        className="absolute block h-0.5 w-full bg-current"
        style={{ top: 7 }} // Center line
        variants={middleVariants}
        animate={variant}
        transition={{ duration: 0.3 }}
      />
      <motion.span
        className="absolute block h-0.5 w-full bg-current"
        style={{ bottom: 0 }}
        variants={bottomVariants}
        animate={variant}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}
