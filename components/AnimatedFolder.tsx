"use client";

import { motion } from "framer-motion";

type FolderProps = {
  color?: string;
  delay?: number;
  snippetCount?: number;
};

export default function AnimatedFolder({ 
  color = "#10b981", 
  delay = 0,
  snippetCount = 0 
}: FolderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        y: -8,
        rotateX: 5,
        transition: { duration: 0.3 }
      }}
      className="relative"
      style={{ perspective: "1000px" }}
    >
      {/* Folder Shadow */}
      <div 
        className="absolute inset-0 translate-y-4 rounded-2xl blur-xl opacity-40"
        style={{ background: color }}
      />

      {/* Folder Container */}
      <div className="relative">
        {/* Folder Tab */}
        <motion.div
          className="relative z-10 ml-4 w-24 rounded-t-xl"
          style={{ 
            background: `linear-gradient(135deg, ${color}dd, ${color}bb)`,
            height: "20px"
          }}
          whileHover={{ scaleX: 1.05 }}
        />

        {/* Folder Body */}
        <motion.div
          className="relative overflow-hidden rounded-2xl"
          style={{ 
            background: `linear-gradient(135deg, ${color}ee, ${color}cc)`,
            width: "200px",
            height: "140px"
          }}
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          
          {/* Folder Content - Snippet Lines */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6">
            {[...Array(Math.min(snippetCount, 4))].map((_, i) => (
              <motion.div
                key={i}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 0.6 }}
                transition={{ 
                  duration: 0.4, 
                  delay: delay + 0.3 + (i * 0.1),
                  ease: "easeOut"
                }}
                className="h-1.5 rounded-full bg-white/60"
                style={{ 
                  width: `${100 - (i * 15)}%`,
                  marginLeft: i % 2 === 0 ? "0" : "10%"
                }}
              />
            ))}
            
            {/* Snippet Count Badge */}
            {snippetCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.3, 
                  delay: delay + 0.6,
                  type: "spring",
                  stiffness: 200
                }}
                className="mt-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold"
                style={{ color }}
              >
                {snippetCount} snippet{snippetCount !== 1 ? "s" : ""}
              </motion.div>
            )}
          </div>

          {/* Corner Fold */}
          <div 
            className="absolute bottom-0 right-0 h-8 w-8"
            style={{
              background: `linear-gradient(135deg, transparent 50%, ${color}99 50%)`,
              borderTopLeftRadius: "4px"
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
