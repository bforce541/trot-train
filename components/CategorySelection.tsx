
import React from 'react';
import { motion } from 'framer-motion';
import { Flag, Activity, Zap, Timer, Heart, Footprints, TrendingUp, User, Dumbbell } from 'lucide-react';
import { ProgramCategory } from '../types';

interface CategorySelectionProps {
  onSelect: (category: ProgramCategory) => void;
}

const categories = [
  { id: 'marathon', label: 'Full Marathon', icon: Flag, desc: '26.2 miles. The ultimate endurance test.', color: 'text-primary' },
  { id: 'half_marathon', label: 'Half Marathon', icon: Flag, desc: '13.1 miles. The perfect blend of speed and stamina.', color: 'text-secondary' },
  { id: '15k', label: '15K Training', icon: Footprints, desc: 'Step up from the 10K distance.', color: 'text-accent-yellow' },
  { id: '10k', label: '10K Training', icon: Timer, desc: 'Build speed endurance for 6.2 miles.', color: 'text-blue-400' },
  { id: '5k', label: '5K Training', icon: Zap, desc: 'Fast, fun, and furious speed work.', color: 'text-orange-400' },
  { id: 'c25k', label: 'Couch to 5K', icon: User, desc: 'Go from zero to running 30 minutes straight.', color: 'text-green-400' },
  { id: 'base_building', label: 'Base Building', icon: TrendingUp, desc: 'Increase aerobic capacity without burnout.', color: 'text-purple-400' },
  { id: 'speed', label: 'Speed & PRs', icon: Timer, desc: 'Intervals and track work to smash your PB.', color: 'text-red-400' },
  { id: 'run_walk', label: 'Run/Walk Method', icon: Activity, desc: 'Sustainable intervals for endurance.', color: 'text-teal-400' },
  { id: 'weight_loss', label: 'Weight Loss', icon: Heart, desc: 'Burn calories with heart-rate focused runs.', color: 'text-pink-400' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const CategorySelection: React.FC<CategorySelectionProps> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold text-off-white mb-4">Choose Your Goal</h2>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          Select a program to begin your personalized onboarding.
        </p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            variants={item}
            onClick={() => onSelect(cat.id as ProgramCategory)}
            className="group relative p-6 bg-white/[0.04] border border-white/5 rounded-2xl hover:bg-white/[0.08] hover:border-primary/30 hover:shadow-[0_0_30px_rgba(108,99,255,0.15)] transition-all text-left flex items-start gap-4 overflow-hidden"
          >
            <div className={`p-3 rounded-xl bg-charcoal border border-white/10 group-hover:scale-110 transition-transform ${cat.color}`}>
              <cat.icon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-off-white group-hover:text-primary transition-colors">{cat.label}</h3>
              <p className="text-sm text-muted mt-1">{cat.desc}</p>
            </div>
            {/* Hover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default CategorySelection;
