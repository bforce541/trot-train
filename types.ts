
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type GoalType = 'finish' | 'time' | 'aggressive' | 'fitness' | 'weight_loss';

export type ProgramCategory = 
  | 'marathon' 
  | 'half_marathon' 
  | '15k' 
  | '10k' 
  | '5k' 
  | 'c25k' 
  | 'base_building' 
  | 'speed' 
  | 'run_walk' 
  | 'weight_loss';

export interface UserPreferences {
  category: ProgramCategory;
  experience: ExperienceLevel;
  weeklyMileage: string; // "0-10", "10-20", etc.
  goal: GoalType;
  goalDetail?: string; // "Sub 4 hours", "Lose 10lbs", "Run 30 mins continuous"
  daysPerWeek: number;
  hasInjuries: boolean;
  raceDate?: string; // Optional, for race plans
  currentPr?: string; // For speed plans
  runWalkRatio?: string; // For run/walk plans
  longestRun?: string; // Context for distance plans
}

export interface Workout {
  type: 'run' | 'cross' | 'rest' | 'long_run' | 'speed' | 'tempo' | 'recovery' | 'walk' | 'interval' | 'strength';
  distance?: string; // e.g., "5 miles" or "40 mins"
  description: string;
  notes?: string;
}

export interface DayPlan {
  dayName: string;
  workout: Workout;
}

export interface WeeklyPlan {
  weekNumber: number;
  focus: string; // e.g., "Base Building", "Peak Week", "Taper"
  totalDistanceApprox: string;
  schedule: DayPlan[];
  tips: string[]; // Fueling, mental, etc.
}

export interface TrainingPlan {
  category: string;
  title: string;
  summary: string;
  weeks: WeeklyPlan[];
}
