import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ReactionsOverlay({ reactions }) {
  return (
    <div className="absolute bottom-4 left-4 z-30 pointer-events-none">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -120, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: 'easeOut' }}
            className="absolute bottom-0 left-0"
            style={{ left: `${Math.random() * 60}px` }}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl">{reaction.emoji}</span>
              <span className="text-[9px] font-semibold text-white bg-black/50 px-1.5 py-0.5 rounded-full mt-0.5 backdrop-blur-sm">
                {reaction.name}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ReactionsOverlay;
