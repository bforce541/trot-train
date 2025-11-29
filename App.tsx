import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Bird } from 'lucide-react';
import Wizard from './components/Wizard';
import PlanDisplay from './components/PlanDisplay';
import CategorySelection from './components/CategorySelection';
import { UserPreferences, TrainingPlan, ProgramCategory } from './types';
import { generateTrainingPlan } from './services/geminiService';

// --- Particle Background Component ---
const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles: {x: number, y: number, vx: number, vy: number, size: number, alpha: number}[] = [];
        const particleCount = 60;

        for(let i=0; i<particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.1
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(108, 99, 255, ${p.alpha})`; // Primary color
                ctx.fill();
            });
            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
             width = canvas.width = window.innerWidth;
             height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />;
}

function App() {
  const [view, setView] = useState<'home' | 'category' | 'wizard' | 'plan'>('home');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProgramCategory>('marathon');
  const [plan, setPlan] = useState<TrainingPlan | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleStart = () => {
    setView('category');
  };

  const handleCategorySelect = (cat: ProgramCategory) => {
    setSelectedCategory(cat);
    setView('wizard');
  };

  const handleWizardComplete = async (prefs: UserPreferences) => {
    setLoading(true);
    try {
      const generatedPlan = await generateTrainingPlan(prefs);
      setPlan(generatedPlan);
      setView('plan');
    } catch (error) {
      console.error("Failed to generate plan", error);
      alert("Something went wrong generating your plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setView('home');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-charcoal text-off-white font-sans">
      {/* Background Gradients & Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/5 rounded-full blur-[150px]" />
      </div>
      <ParticleBackground />

      {/* Navigation */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-off-white cursor-pointer select-none" onClick={handleReset}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(108,99,255,0.4)]">
            <Bird size={20} />
          </div>
          TrotTrain
        </div>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-off-white transition-colors"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-grow relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-grow flex flex-col justify-center items-center text-center px-4 max-w-5xl mx-auto py-12"
            >
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-6xl md:text-8xl font-bold tracking-tight text-off-white mb-8"
              >
                Train Smarter. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary">
                  Trot Further.
                </span>
              </motion.h1>

              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-muted max-w-3xl mb-12 leading-relaxed"
              >
                From your first 5K to a marathon PR. <br className="hidden md:block"/>
                Generate a personalized, adaptive training plan in seconds.
              </motion.p>

              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleStart}
                className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-primary to-secondary font-pj rounded-full focus:outline-none hover:scale-105 shadow-[0_0_30px_rgba(108,99,255,0.4)] hover:shadow-[0_0_50px_rgba(0,201,167,0.5)]"
              >
                Start Training
                <div className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</div>
              </motion.button>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full"
              >
                 {[
                  { title: "Any Distance", desc: "5K, 10K, Half, Full, or just getting started." },
                  { title: "Adaptive Intensity", desc: "Plans for weight loss, speed, or pure endurance." },
                  { title: "Smart Progression", desc: "Scientific tapering and recovery logic built-in." }
                ].map((feature, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/5 hover:bg-white/[0.06] transition-colors">
                    <h3 className="font-bold text-off-white text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted text-sm">{feature.desc}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {view === 'category' && (
             <motion.div
                key="category"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="w-full flex-grow"
             >
                 <CategorySelection onSelect={handleCategorySelect} />
                 <div className="text-center pb-10">
                    <button onClick={() => setView('home')} className="text-muted hover:text-white transition-colors text-sm">Cancel</button>
                 </div>
             </motion.div>
          )}

          {view === 'wizard' && (
            <motion.div
                key="wizard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
            >
                <Wizard 
                    category={selectedCategory} 
                    onComplete={handleWizardComplete} 
                    isLoading={loading} 
                    onBackToCategory={() => setView('category')}
                />
            </motion.div>
          )}

          {view === 'plan' && plan && (
            <motion.div
                key="plan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full"
            >
                <PlanDisplay plan={plan} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="w-full text-center py-8 text-muted text-xs z-10 border-t border-white/5 mt-auto">
        <p className="mb-2">TrotTrain AI Training Platform</p>
        <p className="opacity-50">&copy; {new Date().getFullYear()} TrotTrain.</p>
      </footer>
    </div>
  );
}

export default App;