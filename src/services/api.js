import axios from 'axios';

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || '', withCredentials: true });
const get = (url, params) => client.get(url, { params });

export const authApi = {
  login: (credentials) => client.post('/api/auth/login', credentials),
  register: (data) => client.post('/api/auth/register', data),
  logout: () => client.post('/api/auth/logout'),
  getMe: () => client.get('/api/auth/me')
};

export const profileApi = {
  getProfile: () => client.get('/profile'),
  updateProfile: (data) => client.post('/profile', data),
  updateWeightGoal: (data) => client.post('/profile/weight-goal', {
    goal_type: data.goal_type || 'maintain',
    target_weight_kg: data.target_weight_kg,
    starting_weight_kg: data.starting_weight_kg || data.target_weight_kg
  }),
  changePassword: (data) => client.post('/profile/change-password', {
    ...data,
    confirm_new_password: data.confirm_new_password || data.confirm_password
  })
};

export const overviewApi = {
  getSummary: () => client.get('/api/overview/summary'),
  getRecentSessions: () => client.get('/sessions/recent'),
  getSessionDetails: (id) => client.get(`/sessions/${id}`),
  getFatigueWarnings: () => Promise.resolve({ data: [] }),
  getStreak: async () => {
    const { data } = await client.get('/sessions/recent');
    return { data: { current_streak: data.length ? 1 : 0, total_sessions: data.length } };
  },
  getAiCoaching: () => client.get('/ai/coach-tip'),
  getReadiness: () => client.get('/ai/readiness'),
  getReadinessTrend: () => Promise.resolve({ data: [] }),
  getChartData: () => Promise.resolve({ data: {} }),
  overrideReadiness: () => Promise.resolve({ data: { success: true } }),
  resetReadinessOverride: () => Promise.resolve({ data: { success: true } })
};

export const workoutApi = {
  getExercises: () => client.get('/exercises'),
  logSet: (payload) => client.post('/set/log', {
    ...payload,
    exercise_key: payload.exercise_key || payload.exercise_name,
    reps_counted: payload.reps_counted ?? payload.reps
  }),
  endSession: (payload) => client.post('/session/end', payload)
};

export const trackingApi = {
  searchFood: (query) => get('/food/search', { q: query }),
  logMeal: (meal) => client.post('/nutrition/log', {
    date: meal.date || new Date().toISOString().slice(0, 10),
    meal_name: meal.meal_name || 'Logged Meal',
    calories_consumed: meal.calories,
    protein_g: meal.protein_g || 0,
    carbs_g: meal.carbs_g || 0,
    fat_g: meal.fat_g || 0,
    saturated_fat_g: 0, fiber_g: 0, sodium_mg: 0, sugar_g: 0, calcium_mg: 0, iron_mg: 0, vitamin_c_mg: 0
  }),
  getDailyMealLog: async (date) => {
    const { data } = await client.get(`/nutrition/${date}`);
    return { data: { meals: data.meals || [] } };
  },
  deleteMeal: (mealId, date = new Date().toISOString().slice(0, 10)) => client.delete(`/nutrition/${date}/meals/${mealId}`),
  logCardio: (data) => client.post('/cardio/log', data),
  logWater: (amountMl) => client.post('/water/log', { amount_ml: amountMl }),
  getTodayWater: () => client.get('/water/today'),
  logWeight: (data) => client.post('/weight/log', data),
  getWeightHistory: (days) => get('/weight/history', { days })
};

export const chatApi = { sendMessage: (message) => client.post('/chat', { message }) };

export const adminApi = {
  getUsersDiagnostics: () => client.get('/api/admin/users'),
  updateUserRole: (userId, isAdmin) => client.patch(`/api/admin/users/${userId}/role`, { is_admin: isAdmin }),
  deleteUser: (userId) => client.delete(`/api/admin/users/${userId}`)
};

export default { authApi, profileApi, overviewApi, workoutApi, trackingApi, chatApi, adminApi };
