
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserPreferences, TrainingPlan } from "../types";

const generateTrainingPlan = async (prefs: UserPreferences): Promise<TrainingPlan> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Define the schema for structured output
  const workoutSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, enum: ['run', 'cross', 'rest', 'long_run', 'speed', 'tempo', 'recovery', 'walk', 'interval', 'strength'] },
      distance: { type: Type.STRING, description: "Distance or duration, e.g., '5 miles' or '45 mins'" },
      description: { type: Type.STRING, description: "Brief title of workout" },
      notes: { type: Type.STRING, description: "Specific pacing or execution notes" }
    },
    required: ["type", "description"]
  };

  const daySchema: Schema = {
    type: Type.OBJECT,
    properties: {
      dayName: { type: Type.STRING, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      workout: workoutSchema
    },
    required: ["dayName", "workout"]
  };

  const weekSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      weekNumber: { type: Type.INTEGER },
      focus: { type: Type.STRING, description: "Main focus of the week" },
      totalDistanceApprox: { type: Type.STRING },
      schedule: { type: Type.ARRAY, items: daySchema },
      tips: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["weekNumber", "schedule", "tips"]
  };

  const planSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING },
      title: { type: Type.STRING },
      summary: { type: Type.STRING },
      weeks: { type: Type.ARRAY, items: weekSchema }
    },
    required: ["title", "weeks"]
  };

  // --- Dynamic Prompt Construction ---
  let categoryRules = "";
  let duration = "12 weeks"; // default

  switch (prefs.category) {
    case 'marathon':
      duration = "16 weeks";
      categoryRules = "Build long runs to 20 miles. Taper last 2 weeks. Fueling strategy is critical.";
      break;
    case 'half_marathon':
      duration = "12 weeks";
      categoryRules = "Build long runs to 12-14 miles. Mix of endurance and tempo.";
      break;
    case '15k':
      duration = "10 weeks";
      categoryRules = "Focus on 9-10 mile endurance and threshold pace.";
      break;
    case '10k':
      duration = "8 weeks";
      categoryRules = "Focus on speed endurance. Intervals at 5k/10k pace.";
      break;
    case '5k':
      duration = "8 weeks";
      categoryRules = "Focus on VO2 max, speed intervals (400m/800m), and tempo.";
      break;
    case 'c25k':
      duration = "9 weeks";
      categoryRules = "Couch to 5K structure. Start with Run/Walk intervals. Progress to continuous running by week 9. Be very gentle.";
      break;
    case 'base_building':
      duration = "8 weeks";
      categoryRules = "All easy aerobic mileage. No hard speedwork. Focus on consistency and increasing time on feet.";
      break;
    case 'speed':
      duration = "8 weeks";
      categoryRules = "Aggressive interval training. Track workouts. Hill repeats. Focus on lowering PR.";
      break;
    case 'run_walk':
      duration = "12 weeks";
      categoryRules = `Utilize the Jeff Galloway method or similar. Run/Walk ratio of ${prefs.runWalkRatio || "3 min run / 1 min walk"}. Focus on distance over speed.`;
      break;
    case 'weight_loss':
      duration = "12 weeks";
      categoryRules = "Focus on caloric burn (Zone 2 HR). Consistent movement. Include cross-training instructions for strength.";
      break;
  }

  const prompt = `
    Create a personalized ${duration} running training plan.
    
    USER PROFILE:
    - Program Type: ${prefs.category}
    - Experience: ${prefs.experience}
    - Current Mileage: ${prefs.weeklyMileage}
    - Goal: ${prefs.goal} (${prefs.goalDetail || "General"})
    - Available Days: ${prefs.daysPerWeek}
    - Injuries: ${prefs.hasInjuries ? "Yes (Needs low impact/caution options)" : "None"}
    ${prefs.raceDate ? `- Race Date: ${prefs.raceDate}` : ''}
    ${prefs.currentPr ? `- Current PR: ${prefs.currentPr}` : ''}

    RULES & LOGIC:
    1. Structure: Generate exactly ${duration}.
    2. Category Specifics: ${categoryRules}
    3. General Philosophy:
       - Beginner: Lower volume, safe progression.
       - Advanced: Higher intensity, specific pacing.
       - Recovery: Every 4th week should be lower volume.
       - Long Runs: Essential for distance plans (Weekend).
    4. Content:
       - Include warmups/cooldowns in descriptions.
       - Add nutritional/mental tips in the 'tips' array.
       - Tone: Inspiring, professional, modern coach.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: planSchema,
        temperature: 0.4,
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from AI");
    
    return JSON.parse(jsonText) as TrainingPlan;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export { generateTrainingPlan };
