import React, { useRef } from 'react';
import { TrainingPlan, WeeklyPlan, DayPlan } from '../types';
import { motion } from 'framer-motion';
import { Download, Calendar, Activity, Zap, Coffee, ChevronDown, ChevronUp, Timer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PlanDisplayProps {
  plan: TrainingPlan;
  onReset: () => void;
}

const WorkoutIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'long_run': return <div className="p-2 rounded-full bg-primary/20 text-primary"><Activity size={18} /></div>;
    case 'speed': 
    case 'tempo': 
    case 'interval': return <div className="p-2 rounded-full bg-secondary/20 text-secondary"><Zap size={18} /></div>;
    case 'rest': return <div className="p-2 rounded-full bg-white/10 text-muted"><Coffee size={18} /></div>;
    case 'walk': return <div className="p-2 rounded-full bg-green-400/20 text-green-400"><Activity size={18} /></div>;
    case 'strength': return <div className="p-2 rounded-full bg-orange-400/20 text-orange-400"><Activity size={18} /></div>;
    default: return <div className="p-2 rounded-full bg-accent-yellow/20 text-accent-yellow"><Timer size={18} /></div>;
  }
};

const WeekCard: React.FC<{ week: WeeklyPlan }> = ({ week }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Auto-expand first 2 weeks
  React.useEffect(() => {
    if (week.weekNumber <= 2) setIsOpen(true);
  }, [week.weekNumber]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-white/[0.06] rounded-2xl shadow-lg border border-white/5 overflow-hidden backdrop-blur-sm"
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center w-12 h-12 bg-white/10 rounded-xl font-bold text-off-white">
                <span className="text-[10px] uppercase text-muted">Week</span>
                <span className="text-xl">{week.weekNumber}</span>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-off-white">{week.focus}</h3>
                <p className="text-sm text-muted">Approx. {week.totalDistanceApprox}</p>
            </div>
        </div>
        <div className="text-muted">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isOpen && (
        <div className="px-5 pb-5 bg-black/20 border-t border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 mt-4">
                {week.schedule.map((day, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border flex flex-col justify-between ${day.workout.type === 'rest' ? 'border-transparent bg-transparent opacity-50' : 'bg-white/5 border-white/5 shadow-sm'}`}>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold uppercase text-muted">{day.dayName.substring(0, 3)}</span>
                                {day.workout.type === 'long_run' && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">Long</span>}
                                {(day.workout.type === 'tempo' || day.workout.type === 'speed') && <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full font-medium">Fast</span>}
                            </div>
                            <p className="text-sm font-semibold text-off-white mb-1 leading-tight">{day.workout.description}</p>
                            {day.workout.distance && <p className="text-xs text-secondary font-medium mb-1">{day.workout.distance}</p>}
                            {day.workout.notes && <p className="text-[10px] text-muted leading-tight">{day.workout.notes}</p>}
                        </div>
                    </div>
                ))}
            </div>
            {week.tips && week.tips.length > 0 && (
                <div className="mt-4 p-3 bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg">
                    <p className="text-xs font-bold text-accent-yellow mb-1 flex items-center gap-1"><Zap size={12}/> Coach's Tips</p>
                    <ul className="list-disc list-inside text-xs text-accent-yellow/80 space-y-1">
                        {week.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                </div>
            )}
        </div>
      )}
    </motion.div>
  );
};

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onReset }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsDownloading(true);
    try {
        const element = printRef.current;
        const canvas = await html2canvas(element, { 
            scale: 2,
            backgroundColor: '#0C0F1A' // Ensure PDF background matches charcoal
        });
        const data = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProperties = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
        
        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`TrotTrain-${plan.title.replace(/\s+/g, '-')}.pdf`);
    } catch (e) {
        console.error(e);
        alert("Failed to generate PDF");
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
           <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-wider font-bold">
               {plan.category || "Custom"} Plan
           </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            {plan.title}
          </h1>
          <p className="text-muted mt-2 max-w-2xl">
            {plan.summary}
          </p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={onReset}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-off-white transition-colors"
            >
                Start Over
            </button>
            <button 
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-full font-medium shadow-[0_0_20px_rgba(108,99,255,0.3)] hover:shadow-[0_0_30px_rgba(0,201,167,0.4)] hover:scale-105 transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
                {isDownloading ? (
                    <span className="animate-pulse">Generating...</span>
                ) : (
                    <>
                        <Download size={18} />
                        <span>Download PDF</span>
                    </>
                )}
            </button>
        </div>
      </div>

      <div ref={printRef} className="bg-charcoal pb-10">
          {plan.weeks.map((week) => (
            <WeekCard key={week.weekNumber} week={week} />
          ))}
      </div>

      <div className="mt-12 text-center pb-20 no-print">
          <p className="text-muted text-sm mb-4">
              Consistency is key. Trust the process.
          </p>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 rounded-full bg-accent-yellow animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
      </div>
    </div>
  );
};

export default PlanDisplay;