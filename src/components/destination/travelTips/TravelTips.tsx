'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

type TravelTipsProps = {
  onOpen: () => void;
  className?: string;
};

export default function TravelTips({ onOpen, className = '' }: TravelTipsProps) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ scale: 1.01, y: -2, boxShadow: '0 26px 60px -24px rgba(16,185,129,0.72)' }}
      whileTap={{ scale: 0.985 }}
      className={`w-full rounded-3xl bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 p-px shadow-lg shadow-emerald-950/20 ${className}`}
    >
      <div className="rounded-[calc(1.5rem-1px)] bg-slate-950/95 px-5 py-4 text-left text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-2 text-emerald-100">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">✨ AI Travel Tips</p>
              <p className="mt-0.5 text-xs text-emerald-100/85">
                Unlock personalized travel guidance for this destination.
              </p>
            </div>
          </div>

          <div className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-50">
            Open
          </div>
        </div>
      </div>
    </motion.button>
  );
}
