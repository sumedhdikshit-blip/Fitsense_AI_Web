// Standalone Mock API Service Layer for FitSense AI React Frontend Demo

const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

const DEMO_USER = {
  user_id: 'demo_athlete_01',
  id: 'demo_athlete_01',
  username: 'demo',
  name: 'Demo Athlete',
  email: 'demo@fitsense.ai',
  role: 'admin',
  is_admin: true
};

const DEMO_PROFILE = {
  name: 'Demo Athlete',
  weight_kg: 75.0,
  height_cm: 175,
  age: 25,
  sex: 'male',
  fitness_goal: 'Build Muscle & Athletic Telemetry',
  target_weight_kg: 70.0,
  sleep_hours: 8.0,
  stress_level: 2,
  exercise_freq: 'high',
  diet_quality: 'excellent',
  alcohol_consumption: 'none'
};

const DEMO_EXERCISES = [
  { key: 'barbell_squat', display_name: 'Barbell Back Squat', category: 'lower_body', mode: 'rep' },
  { key: 'romanian_deadlift', display_name: 'Romanian Deadlift', category: 'lower_body', mode: 'rep' },
  { key: 'bench_press', display_name: 'Barbell Bench Press', category: 'upper_body', mode: 'rep' },
  { key: 'overhead_press', display_name: 'Standing Overhead Press', category: 'upper_body', mode: 'rep' },
  { key: 'pull_ups', display_name: 'Bodyweight Pull-Ups', category: 'upper_body', mode: 'rep' },
  { key: 'plank', display_name: 'Elbow Plank Hold', category: 'core', mode: 'hold' },
  { key: 'hanging_leg_raise', display_name: 'Hanging Leg Raise', category: 'core', mode: 'rep' }
];

let mockWeightHistory = [
  { date: '2026-08-25', weight_kg: 76.5, body_fat_pct: 15.2 },
  { date: '2026-08-27', weight_kg: 76.1, body_fat_pct: 15.0 },
  { date: '2026-08-29', weight_kg: 75.6, body_fat_pct: 14.8 },
  { date: '2026-08-31', weight_kg: 75.2, body_fat_pct: 14.6 },
  { date: '2026-09-01', weight_kg: 75.0, body_fat_pct: 14.5 }
];

let mockMealLog = [
  { id: 1, meal_name: 'Oatmeal & Protein Shake', calories: 450, protein_g: 35, carbs_g: 50, fat_g: 8 },
  { id: 2, meal_name: 'Grilled Chicken & Rice', calories: 650, protein_g: 55, carbs_g: 70, fat_g: 12 },
  { id: 3, meal_name: 'Greek Yogurt & Almonds', calories: 250, protein_g: 20, carbs_g: 15, fat_g: 10 }
];

let mockWaterIntake = 1750; // ml

let mockRecentSessions = [
  {
    session_id: 101,
    date: '2026-08-31T16:30:00Z',
    exercises_done: 'Barbell Back Squat, Romanian Deadlift',
    total_sets: 6,
    total_reps: 48,
    total_calories_burned: 420.0,
    avg_form_score: 92,
    total_duration_mins: 45.5,
    notes: 'Strong depth on squats. Rested 90s between sets.',
    exercises: [
      {
        exercise_name: 'Barbell Back Squat',
        exercise_key: 'barbell_squat',
        sets: [
          { set_number: 1, reps_counted: 8, weight_kg: 100, rpe: 7, avg_form_score: 95 },
          { set_number: 2, reps_counted: 8, weight_kg: 105, rpe: 8, avg_form_score: 92 },
          { set_number: 3, reps_counted: 8, weight_kg: 105, rpe: 8, avg_form_score: 90 }
        ]
      }
    ]
  },
  {
    session_id: 100,
    date: '2026-08-29T14:15:00Z',
    exercises_done: 'Barbell Bench Press, Overhead Press',
    total_sets: 8,
    total_reps: 64,
    total_calories_burned: 380.0,
    avg_form_score: 88,
    total_duration_mins: 40.0,
    notes: 'Good upper body pump. Slight elbow flare on final set.',
    exercises: []
  }
];

let mockAdminUsers = [
  { user_id: 'demo_athlete_01', username: 'demo', name: 'Demo Athlete', role: 'admin', is_admin: true, total_sessions: 14, last_active_date: '2026-09-01T17:30:00Z' },
  { user_id: 'user_102', username: 'john_doe', name: 'John Doe', role: 'user', is_admin: false, total_sessions: 8, last_active_date: '2026-08-30T10:15:00Z' },
  { user_id: 'user_103', username: 'sarah_fit', name: 'Sarah Jenkins', role: 'user', is_admin: false, total_sessions: 22, last_active_date: '2026-08-31T19:20:00Z' }
];

// Auth APIs
export const authApi = {
  login: async (credentials) => {
    await delay();
    return { data: DEMO_USER };
  },
  register: async (userData) => {
    await delay();
    return { data: DEMO_USER };
  },
  logout: async () => {
    await delay();
    return { data: { message: 'Logged out successfully' } };
  },
  getMe: async () => {
    await delay();
    return { data: DEMO_USER };
  }
};

// Profile APIs
export const profileApi = {
  getProfile: async () => {
    await delay();
    return { data: DEMO_PROFILE };
  },
  updateProfile: async (data) => {
    await delay();
    Object.assign(DEMO_PROFILE, data);
    return { data: DEMO_PROFILE };
  },
  updateWeightGoal: async (data) => {
    await delay();
    DEMO_PROFILE.target_weight_kg = data.target_weight_kg;
    return { data: DEMO_PROFILE };
  },
  changePassword: async (data) => {
    await delay();
    return { data: { message: 'Password updated successfully' } };
  }
};

// Dashboard / Overview APIs
export const overviewApi = {
  getSummary: async () => {
    await delay();
    const consumed = mockMealLog.reduce((acc, m) => acc + m.calories, 0);
    return {
      data: {
        calories_consumed: consumed,
        calories_burned: 420,
        net_calories: consumed - 420,
        protein_g: 110,
        carbs_g: 135,
        fat_g: 30
      }
    };
  },
  getRecentSessions: async () => {
    await delay();
    return { data: mockRecentSessions };
  },
  getSessionDetails: async (sessionId) => {
    await delay();
    const found = mockRecentSessions.find(s => s.session_id === Number(sessionId)) || mockRecentSessions[0];
    return { data: found };
  },
  getFatigueWarnings: async () => {
    await delay();
    return { data: [] };
  },
  getStreak: async () => {
    await delay();
    return { data: { current_streak: 5, total_sessions: 14 } };
  },
  getAiCoaching: async () => {
    await delay();
    return { data: { tip: "Your recovery readiness is optimal today. Focus on progressive overload on compound lifts!" } };
  },
  getReadinessTrend: async () => {
    await delay();
    return { data: [80, 85, 82, 88, 90, 85] };
  },
  getChartData: async () => {
    await delay();
    return { data: {} };
  },
  overrideReadiness: async (payload) => {
    await delay();
    return { data: { success: true } };
  },
  resetReadinessOverride: async () => {
    await delay();
    return { data: { success: true } };
  }
};

// Workout APIs
export const workoutApi = {
  getExercises: async () => {
    await delay();
    return { data: DEMO_EXERCISES };
  },
  logSet: async (setPayload) => {
    await delay();
    return { data: { success: true, session_id: 102 } };
  },
  endSession: async (sessionPayload) => {
    await delay();
    const newSession = {
      session_id: Date.now(),
      date: new Date().toISOString(),
      exercises_done: sessionPayload.notes || 'Custom Workout Session',
      total_sets: 4,
      total_reps: 32,
      total_calories_burned: 310.0,
      avg_form_score: 94,
      total_duration_mins: 35.0,
      notes: sessionPayload.notes || ''
    };
    mockRecentSessions.unshift(newSession);
    return { data: { success: true, total_calories: 310.0 } };
  }
};

// Calculator / Food / Water / Weight APIs
export const trackingApi = {
  searchFood: async (query) => {
    await delay();
    return {
      data: [
        { name: 'Chicken Breast (Grilled)', calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
        { name: 'Brown Rice (1 cup)', calories: 216, protein_g: 5, carbs_g: 45, fat_g: 1.8 },
        { name: 'Whole Eggs (2 Large)', calories: 140, protein_g: 12, carbs_g: 1, fat_g: 10 }
      ]
    };
  },
  logMeal: async (mealData) => {
    await delay();
    const newMeal = {
      id: Date.now(),
      meal_name: mealData.meal_name || 'Logged Meal',
      calories: parseFloat(mealData.calories) || 0,
      protein_g: parseFloat(mealData.protein_g) || 0,
      carbs_g: parseFloat(mealData.carbs_g) || 0,
      fat_g: parseFloat(mealData.fat_g) || 0
    };
    mockMealLog.push(newMeal);
    return { data: newMeal };
  },
  getDailyMealLog: async (date) => {
    await delay();
    return { data: { meals: mockMealLog } };
  },
  deleteMeal: async (mealId) => {
    await delay();
    mockMealLog = mockMealLog.filter(m => m.id !== Number(mealId));
    return { data: { success: true } };
  },
  logWater: async (amountMl) => {
    await delay();
    mockWaterIntake += Number(amountMl);
    return { data: { total_ml: mockWaterIntake } };
  },
  getTodayWater: async () => {
    await delay();
    return { data: { total_ml: mockWaterIntake } };
  },
  logWeight: async (weightData) => {
    await delay();
    const entry = {
      date: weightData.date || new Date().toISOString().split('T')[0],
      weight_kg: parseFloat(weightData.weight_kg),
      body_fat_pct: 14.5
    };
    DEMO_PROFILE.weight_kg = entry.weight_kg;
    mockWeightHistory.push(entry);
    return { data: entry };
  },
  getWeightHistory: async (days) => {
    await delay();
    return { data: mockWeightHistory };
  }
};

// Chat Service (Dynamic AI Coach Assistant Response)
export const chatApi = {
  sendMessage: async (message) => {
    await delay(300);
    const msgLower = message.toLowerCase();
    let reply = "That's a great fitness question! Consistency, progressive overload, and proper recovery are the keys to long-term progress.";

    if (msgLower.includes('protein') || msgLower.includes('diet') || msgLower.includes('food') || msgLower.includes('eat')) {
      reply = "Aim for roughly 1.6 - 2.2 grams of protein per kilogram of body weight daily. Foods like chicken breast, eggs, Greek yogurt, and protein shakes are great sources!";
    } else if (msgLower.includes('squat') || msgLower.includes('leg') || msgLower.includes('workout')) {
      reply = "For heavy squats, maintain a brace in your core, keep your chest upright, and break at the knees and hips simultaneously. Aim for 3-4 sets of 6-10 reps.";
    } else if (msgLower.includes('weight') || msgLower.includes('fat') || msgLower.includes('loss') || msgLower.includes('cut')) {
      reply = "To lose weight sustainably, aim for a moderate calorie deficit of 300-500 kcal below your TDEE while keeping protein high to preserve muscle mass.";
    }

    return { data: { reply } };
  }
};

// Admin Services
export const adminApi = {
  getUsersDiagnostics: async () => {
    await delay();
    return { data: mockAdminUsers };
  },
  updateUserRole: async (userId, isAdmin) => {
    await delay();
    const u = mockAdminUsers.find(user => user.user_id === userId);
    if (u) {
      u.is_admin = isAdmin;
      u.role = isAdmin ? 'admin' : 'user';
    }
    return { data: { success: true } };
  },
  deleteUser: async (userId) => {
    await delay();
    mockAdminUsers = mockAdminUsers.filter(u => u.user_id !== userId);
    return { data: { success: true } };
  }
};

export default {
  authApi,
  profileApi,
  overviewApi,
  workoutApi,
  trackingApi,
  chatApi,
  adminApi
};
