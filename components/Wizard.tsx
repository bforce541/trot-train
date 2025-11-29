
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Activity, Calendar, Trophy, AlertCircle, Watch, Footprints, User } from 'lucide-react';
import { UserPreferences, ExperienceLevel, GoalType, ProgramCategory } from '../types';

interface WizardProps {
  category: ProgramCategory;
  onComplete: (prefs: UserPreferences) => void;
  isLoading: boolean;
  onBackToCategory: () => void;
}

// Define step identifiers
type StepId = 'experience' | 'mileage' | 'goal' | 'days' | 'injury' | 'date' | 'pr' | 'runwalk' | 'fitness' | 'longestRun';

interface StepConfig {
  id: StepId;
  title: string;
  subtitle: string;
}

// Configuration to map categories to steps
const CATEGORY_STEPS: Record<ProgramCategory, StepId[]> = {
  marathon: ['experience', 'mileage', 'longestRun', 'goal', 'days', 'injury', 'date'],
  half_marathon: ['experience', 'mileage', 'longestRun', 'goal', 'days', 'injury', 'date'],
  '15k': ['experience', 'mileage', 'goal', 'days', 'injury', 'date'],
  '10k': ['experience', 'mileage', 'goal', 'days', 'injury', 'date'],
  '5k': ['experience', 'mileage', 'goal', 'days', 'injury', 'date'],
  c25k: ['fitness', 'days', 'goal', 'injury'],
  base_building: ['experience', 'mileage', 'days', 'injury'],
  speed: ['experience', 'mileage', 'pr', 'goal', 'days', 'injury'],
  run_walk: ['experience', 'runwalk', 'days', 'goal', 'injury', 'date'],
  weight_loss: ['experience', 'mileage', 'days', 'injury']
};

const STEP_DETAILS: Record<StepId, StepConfig> = {
  experience: { id: 'experience', title: 'Running Experience', subtitle: "What's your background?" },
  mileage: { id: 'mileage', title: 'Weekly Mileage', subtitle: "How much are you running now?" },
  longestRun: { id: 'longestRun', title: 'Longest Run', subtitle: "What's the longest you've run recently?" },
  goal: { id: 'goal', title: 'Main Goal', subtitle: "What are you aiming for?" },
  days: { id: 'days', title: 'Schedule', subtitle: "How many days can you train?" },
  injury: { id: 'injury', title: 'Injury History', subtitle: "Any concerns we should know about?" },
  date: { id: 'date', title: 'Race Date', subtitle: "When is the big day?" },
  pr: { id: 'pr', title: 'Current Best', subtitle: "What is your current PR or typical pace?" },
  runwalk: { id: 'runwalk', title: 'Run/Walk Ratio', subtitle: "Preferred interval style?" },
  fitness: { id: 'fitness', title: 'Current Fitness', subtitle: "How active are you currently?" },
};

const Wizard: React.FC<WizardProps> = ({ category, onComplete, isLoading, onBackToCategory }) => {
  const steps = CATEGORY_STEPS[category];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const [prefs, setPrefs] = useState<UserPreferences>({
    category,
    experience: 'beginner',
    weeklyMileage: '10-20',
    goal: 'finish',
    daysPerWeek: 4,
    hasInjuries: false,
    raceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const currentStepId = steps[currentStepIndex];
  const currentStepConfig = STEP_DETAILS[currentStepId];

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete(prefs);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      onBackToCategory();
    }
  };

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const cardVariants = {
    hidden: { opacity: 0, x: 20, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -20, scale: 0.98 }
  };

  // --- Render Functions for Steps ---

  const renderExperience = () => (
    <div className="space-y-3">
        {['beginner', 'intermediate', 'advanced'].map((level) => (
            <button
                key={level}
                onClick={() => setPrefs({ ...prefs, experience: level as ExperienceLevel })}
                className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group
                    ${prefs.experience === level 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}`}
            >
                <div>
                    <span className="block text-lg font-semibold capitalize text-off-white">{level}</span>
                    <span className="text-sm text-muted">
                        {level === 'beginner' && "Running < 6 months or returning."}
                        {level === 'intermediate' && "Consistent runner for 6+ months."}
                        {level === 'advanced' && "Competitive runner, structured training."}
                    </span>
                </div>
                {prefs.experience === level && <Check size={20} className="text-primary" />}
            </button>
        ))}
    </div>
  );

  const renderMileage = () => (
    <div className="space-y-3">
        {['0-5', '5-15', '15-25', '25-40', '40+'].map((range) => (
        <button
            key={range}
            onClick={() => setPrefs({ ...prefs, weeklyMileage: range })}
            className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between
                ${prefs.weeklyMileage === range 
                    ? 'border-primary bg-primary/10' 
                    : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}`}
        >
            <span className="text-lg font-semibold text-off-white">{range} miles / week</span>
            {prefs.weeklyMileage === range && <Check className="text-primary" size={20} />}
        </button>
        ))}
    </div>
  );

  const renderGoal = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
            { val: 'finish', label: 'Just Finish', icon: Trophy, desc: "Run the distance" },
            { val: 'time', label: 'Time Goal', icon: Watch, desc: "Beat a specific time" },
            { val: 'fitness', label: 'Fitness', icon: Activity, desc: "Feel healthier" },
            { val: 'weight_loss', label: 'Burn', icon: Activity, desc: "Maximize calories" },
        ].map((item) => (
            <button
                key={item.val}
                onClick={() => setPrefs({ ...prefs, goal: item.val as GoalType })}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center
                    ${prefs.goal === item.val
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}`}
            >
                <item.icon className={prefs.goal === item.val ? 'text-primary' : 'text-muted'} size={24} />
                <div>
                  <span className="font-semibold text-off-white block">{item.label}</span>
                  <span className="text-xs text-muted">{item.desc}</span>
                </div>
            </button>
        ))}
        {prefs.goal === 'time' && (
          <div className="col-span-1 md:col-span-2 mt-2">
            <input 
              type="text" 
              placeholder="e.g. Sub 4 hours, Sub 25 mins"
              value={prefs.goalDetail || ''}
              onChange={(e) => setPrefs({...prefs, goalDetail: e.target.value})}
              className="w-full p-3 bg-charcoal border border-white/20 rounded-xl text-off-white focus:border-primary outline-none"
            />
          </div>
        )}
    </div>
  );

  const renderDays = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="w-full">
            <input 
                type="range" 
                min="3" 
                max="7" 
                step="1"
                value={prefs.daysPerWeek}
                onChange={(e) => setPrefs({...prefs, daysPerWeek: parseInt(e.target.value)})}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-4 text-muted text-sm font-medium">
                <span>3 Days</span>
                <span>5 Days</span>
                <span>7 Days</span>
            </div>
            <div className="mt-8 text-center">
                <span className="text-6xl font-bold text-primary">{prefs.daysPerWeek}</span>
                <span className="text-muted ml-2 text-xl">days / week</span>
            </div>
        </div>
    </div>
  );

  const renderInjury = () => (
    <div className="flex flex-col gap-4">
        <button
            onClick={() => setPrefs({ ...prefs, hasInjuries: false })}
            className={`p-6 rounded-xl border transition-all flex items-center gap-4
                ${!prefs.hasInjuries
                    ? 'border-secondary bg-secondary/10' 
                    : 'border-white/10 opacity-60 hover:opacity-100'}`}
        >
            <div className="bg-secondary/20 p-2 rounded-full text-secondary"><Check size={24} /></div>
            <div className="text-left">
                <h4 className="font-bold text-off-white">I'm healthy</h4>
                <p className="text-sm text-muted">Ready to train at full capacity.</p>
            </div>
        </button>

        <button
            onClick={() => setPrefs({ ...prefs, hasInjuries: true })}
            className={`p-6 rounded-xl border transition-all flex items-center gap-4
                ${prefs.hasInjuries
                    ? 'border-accent-red bg-accent-red/10' 
                    : 'border-white/10 opacity-60 hover:opacity-100'}`}
        >
                <div className="bg-accent-red/20 p-2 rounded-full text-accent-red"><AlertCircle size={24} /></div>
                <div className="text-left">
                <h4 className="font-bold text-off-white">Managing issues</h4>
                <p className="text-sm text-muted">I need lower impact or caution.</p>
            </div>
        </button>
    </div>
  );

  const renderDate = () => (
    <div className="flex flex-col items-center justify-center h-full gap-4">
       <input 
           type="date"
           value={prefs.raceDate}
           onChange={(e) => setPrefs({...prefs, raceDate: e.target.value})}
           className="p-4 text-xl border border-white/20 rounded-xl bg-charcoal text-off-white focus:border-primary focus:outline-none w-full text-center"
       />
       <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full text-sm">
           <Calendar size={16} />
           <span>We'll build the schedule backward from this date.</span>
       </div>
    </div>
  );

  const renderPR = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted">Leave blank if you don't know.</p>
      <input 
        type="text" 
        placeholder="e.g. 24:30 for 5k"
        value={prefs.currentPr || ''}
        onChange={(e) => setPrefs({...prefs, currentPr: e.target.value})}
        className="w-full p-4 bg-charcoal border border-white/20 rounded-xl text-off-white focus:border-primary outline-none text-lg"
      />
    </div>
  );

  const renderRunWalk = () => (
    <div className="space-y-3">
        {['30s run / 30s walk', '1 min run / 1 min walk', '2 min run / 1 min walk', '3 min run / 1 min walk', 'Custom'].map((ratio) => (
        <button
            key={ratio}
            onClick={() => setPrefs({ ...prefs, runWalkRatio: ratio })}
            className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between
                ${prefs.runWalkRatio === ratio 
                    ? 'border-primary bg-primary/10' 
                    : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}`}
        >
            <span className="text-lg font-semibold text-off-white">{ratio}</span>
            {prefs.runWalkRatio === ratio && <Check className="text-primary" size={20} />}
        </button>
        ))}
    </div>
  );

  const renderFitness = () => (
    <div className="space-y-3">
        {['Sedentary', 'Lightly Active (Walks)', 'Active (Gym/Sports)', 'Runner'].map((lvl) => (
             <button
             key={lvl}
             onClick={() => setPrefs({ ...prefs, experience: lvl === 'Runner' ? 'intermediate' : 'beginner', weeklyMileage: '0-5' })}
             className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group focus:outline-none
                 ${(prefs.experience === 'beginner' && lvl !== 'Runner') || (prefs.experience === 'intermediate' && lvl === 'Runner')
                     ? 'border-primary bg-primary/10' 
                     : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}`}
            >
                <span className="text-lg font-semibold text-off-white">{lvl}</span>
            </button>
        ))}
    </div>
  );

  const renderLongestRun = () => (
    <div className="space-y-3">
       <input 
        type="text" 
        placeholder="e.g. 6 miles, 45 mins"
        value={prefs.longestRun || ''}
        onChange={(e) => setPrefs({...prefs, longestRun: e.target.value})}
        className="w-full p-4 bg-charcoal border border-white/20 rounded-xl text-off-white focus:border-primary outline-none text-lg"
      />
      <p className="text-sm text-muted">This helps us safely scale your long runs.</p>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between text-xs font-medium text-muted uppercase tracking-wider mb-2">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepId}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="bg-white/[0.06] p-8 rounded-3xl border border-white/5 backdrop-blur-md min-h-[420px] flex flex-col shadow-2xl"
        >
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-off-white mb-2">{currentStepConfig.title}</h2>
                <p className="text-muted text-lg">{currentStepConfig.subtitle}</p>
            </div>

            <div className="flex-grow">
               {currentStepId === 'experience' && renderExperience()}
               {currentStepId === 'mileage' && renderMileage()}
               {currentStepId === 'goal' && renderGoal()}
               {currentStepId === 'days' && renderDays()}
               {currentStepId === 'injury' && renderInjury()}
               {currentStepId === 'date' && renderDate()}
               {currentStepId === 'pr' && renderPR()}
               {currentStepId === 'runwalk' && renderRunWalk()}
               {currentStepId === 'fitness' && renderFitness()}
               {currentStepId === 'longestRun' && renderLongestRun()}
            </div>

            <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/10">
                <button 
                    onClick={prevStep} 
                    disabled={isLoading}
                    className="flex items-center gap-2 text-muted font-medium hover:text-off-white transition-colors"
                >
                    <ArrowLeft size={20} /> Back
                </button>

                <button 
                    onClick={nextStep}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(108,99,255,0.3)] hover:shadow-[0_0_30px_rgba(0,201,167,0.4)] hover:scale-105 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Generating...
                        </span>
                    ) : (
                        <>
                            {currentStepIndex === steps.length - 1 ? 'Generate Plan' : 'Next'}
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Wizard;
