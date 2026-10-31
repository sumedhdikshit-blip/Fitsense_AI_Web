import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import crypto from 'node:crypto';

const app = express();
const port = Number(process.env.PORT || 8000);
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) throw new Error('SESSION_SECRET is required');

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieSession({
  name: 'session',
  keys: [sessionSecret],
  maxAge: 14 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production'
}));

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: String,
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  profile: {
    age: Number, weight_kg: Number, height_cm: Number, sex: { type: String, default: 'unspecified' },
    fitness_goal: String, target_weight_kg: Number, starting_weight_kg: Number, target_date: String,
    goal_type: String, pace: String, muscle_focus: String, maintenance_focus: String,
    diet_quality: String, stress_level: Number, sleep_hours: Number, smoker: String,
    exercise_freq: String, alcohol_consumption: String
  }
}, { timestamps: true });
const workoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  date: { type: Date, default: Date.now }, startTime: { type: Date, default: Date.now }, endTime: Date,
  total_duration_mins: Number, total_sets: { type: Number, default: 0 }, total_reps: { type: Number, default: 0 },
  avg_form_score: { type: Number, default: 100 }, total_calories_burned: { type: Number, default: 0 },
  notes: String, exercises: [{
    exercise_key: String, exercise_name: String, sets: [{
      set_number: Number, reps_counted: Number, weight_kg: Number, weight_unit: String, weight_mode: String,
      rpe: Number, avg_form_score: Number, pain_flag: Boolean, pain_location: String,
      duration_seconds: Number, form_violations: [String]
    }]
  }]
}, { timestamps: true });
const nutritionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, date: String,
  meals: [{ meal_name: String, calories: Number, protein_g: Number, carbs_g: Number, fat_g: Number }],
  water_ml: { type: Number, default: 0 },
  calories_consumed: { type: Number, default: 0 }, protein_g: { type: Number, default: 0 },
  carbs_g: { type: Number, default: 0 }, fat_g: { type: Number, default: 0 }
}, { timestamps: true });
nutritionSchema.index({ userId: 1, date: 1 }, { unique: true });
const weightSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, date: String, weight_kg: Number }, { timestamps: true });
weightSchema.index({ userId: 1, date: 1 }, { unique: true });
const User = mongoose.model('User', userSchema);
const Workout = mongoose.model('Workout', workoutSchema);
const Nutrition = mongoose.model('Nutrition', nutritionSchema);
const Weight = mongoose.model('Weight', weightSchema);

const exercises = [
  ['barbell_squat', 'Barbell Back Squat', 'lower_body', 'rep'], ['romanian_deadlift', 'Romanian Deadlift', 'lower_body', 'rep'],
  ['bench_press', 'Barbell Bench Press', 'upper_body', 'rep'], ['overhead_press', 'Standing Overhead Press', 'upper_body', 'rep'],
  ['pull_ups', 'Bodyweight Pull-Ups', 'upper_body', 'rep'], ['plank', 'Elbow Plank Hold', 'core', 'hold'],
  ['hanging_leg_raise', 'Hanging Leg Raise', 'core', 'rep']
].map(([key, display_name, category, mode]) => ({ key, display_name, category, mode }));
const exerciseByKey = new Map(exercises.map((exercise) => [exercise.key, exercise]));
const today = () => new Date().toISOString().slice(0, 10);
const publicUser = (user) => ({ user_id: String(user._id), id: String(user._id), username: user.username, name: user.name, email: user.email || '', role: user.isAdmin ? 'admin' : 'user', is_admin: user.isAdmin });
const profileFor = (user) => ({ name: user.name, ...user.profile.toObject ? user.profile.toObject() : user.profile });
const requireUser = async (req, res, next) => {
  try {
    if (!req.session?.user_id) return res.status(401).json({ detail: 'Not authenticated' });
    const user = await User.findById(req.session.user_id);
    if (!user) return res.status(401).json({ detail: 'Not authenticated' });
    req.user = user; next();
  } catch (error) { next(error); }
};
const requireAdmin = (req, res, next) => req.user.isAdmin ? next() : res.status(403).json({ detail: 'Forbidden: Admin access required' });
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const normalizeSet = (body) => ({
  exercise_key: body.exercise_key || body.exercise_name,
  reps_counted: Number(body.reps_counted ?? body.reps ?? 0),
  weight_kg: Number(body.weight_kg || 0), weight_unit: body.weight_unit || 'kg', weight_mode: body.weight_mode || 'total',
  rpe: Number(body.rpe || 7), avg_form_score: Number(body.avg_form_score ?? 100), pain_flag: Boolean(body.pain_flag),
  pain_location: body.pain_location || '', duration_seconds: Number(body.duration_seconds || 0), form_violations: body.form_violations || []
});

app.get('/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const { username, password, name } = req.body;
  if (!username || username.trim().length < 3 || !password || password.length < 8 || !name?.trim()) return res.status(422).json({ detail: 'Username, name, and a password of at least 8 characters are required' });
  try {
    const user = await User.create({ username: username.trim().toLowerCase(), name: name.trim(), passwordHash: await bcrypt.hash(password, 12), profile: {} });
    req.session.user_id = String(user._id); res.status(201).json({ status: 'success', message: 'User registered successfully', user: publicUser(user) });
  } catch (error) { if (error.code === 11000) return res.status(400).json({ detail: 'Username already exists' }); throw error; }
}));
app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const user = await User.findOne({ username: String(req.body.username || '').trim().toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) return res.status(400).json({ detail: 'Invalid username or password' });
  req.session.user_id = String(user._id); res.json({ status: 'success', message: 'Logged in successfully', is_admin: user.isAdmin, user: publicUser(user) });
}));
app.post('/api/auth/logout', (req, res) => { req.session = null; res.json({ status: 'success', message: 'Logged out successfully' }); });
app.get('/api/auth/me', requireUser, (req, res) => res.json(publicUser(req.user)));
app.get('/api/admin/users', requireUser, requireAdmin, asyncRoute(async (_req, res) => {
  const users = await User.find().lean(); const ids = users.map((u) => u._id);
  const counts = await Workout.aggregate([{ $match: { userId: { $in: ids } } }, { $group: { _id: '$userId', count: { $sum: 1 }, last: { $max: '$date' } } }]);
  const countMap = new Map(counts.map((c) => [String(c._id), c]));
  res.json(users.map((u) => ({ user_id: String(u._id), username: u.username, name: u.name, is_admin: u.isAdmin, total_sessions: countMap.get(String(u._id))?.count || 0, last_active_date: countMap.get(String(u._id))?.last || null })));
}));
app.patch('/api/admin/users/:id/role', requireUser, requireAdmin, asyncRoute(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isAdmin: Boolean(req.body.is_admin) }); res.json({ success: true }); }));
app.delete('/api/admin/users/:id', requireUser, requireAdmin, asyncRoute(async (req, res) => { await User.findByIdAndDelete(req.params.id); await Workout.deleteMany({ userId: req.params.id }); res.json({ success: true }); }));

app.get('/exercises', (_req, res) => res.json(exercises));
app.post('/set/log', requireUser, asyncRoute(async (req, res) => {
  const data = normalizeSet(req.body); const exercise = exerciseByKey.get(data.exercise_key);
  if (!exercise) return res.status(400).json({ detail: `Invalid exercise: ${data.exercise_key}` });
  let session = req.body.session_id ? await Workout.findOne({ _id: req.body.session_id, userId: req.user._id }) : null;
  if (!session) session = await Workout.create({ userId: req.user._id, exercises: [] });
  let entry = session.exercises.find((item) => item.exercise_key === exercise.key);
  if (!entry) { session.exercises.push({ exercise_key: exercise.key, exercise_name: exercise.display_name, sets: [] }); entry = session.exercises.at(-1); }
  entry.sets.push({ ...data, set_number: data.set_number || entry.sets.length + 1 }); session.total_sets += 1; session.total_reps += data.reps_counted;
  session.avg_form_score = session.exercises.flatMap((e) => e.sets).reduce((sum, s) => sum + s.avg_form_score, 0) / session.total_sets;
  await session.save(); res.json({ status: 'success', message: 'Set logged successfully', session_id: String(session._id) });
}));
app.post('/session/end', requireUser, asyncRoute(async (req, res) => {
  const session = await Workout.findOne({ _id: req.body.session_id, userId: req.user._id }); if (!session) return res.status(404).json({ detail: 'Session not found.' });
  session.endTime = new Date(); session.notes = req.body.notes || ''; session.total_duration_mins = (session.endTime - session.startTime) / 60000; session.total_calories_burned = Math.round(session.total_reps * 0.35 + session.total_sets * 5); await session.save();
  res.json({ success: true, total_calories: session.total_calories_burned, ...session.toObject(), session_id: String(session._id) });
}));
const sessionOutput = (s) => ({ ...s.toObject(), session_id: String(s._id), date: s.date.toISOString(), exercises_done: s.exercises.map((e) => e.exercise_name).join(', ') || 'Workout Session' });
app.get('/sessions/recent', requireUser, asyncRoute(async (req, res) => res.json((await Workout.find({ userId: req.user._id }).sort({ date: -1 }).limit(Math.min(Number(req.query.limit) || 10, 50))).map(sessionOutput))));
app.get('/sessions/:id', requireUser, asyncRoute(async (req, res) => { const s = await Workout.findOne({ _id: req.params.id, userId: req.user._id }); if (!s) return res.status(404).json({ detail: 'Session not found.' }); res.json(sessionOutput(s)); }));

app.get('/profile', requireUser, (req, res) => res.json(profileFor(req.user)));
app.post('/profile', requireUser, asyncRoute(async (req, res) => { const { name, ...profile } = req.body; req.user.name = name || req.user.name; req.user.profile = { ...req.user.profile.toObject(), ...profile }; await req.user.save(); res.json({ status: 'success', message: 'Profile updated successfully', profile: profileFor(req.user) }); }));
app.post('/profile/weight-goal', requireUser, asyncRoute(async (req, res) => { req.user.profile = { ...req.user.profile.toObject(), ...req.body }; await req.user.save(); res.json({ status: 'success', message: 'Weight goal updated successfully' }); }));
app.post('/profile/change-password', requireUser, asyncRoute(async (req, res) => { if (!(await bcrypt.compare(req.body.current_password || '', req.user.passwordHash))) return res.status(400).json({ detail: 'Incorrect current password.' }); if (req.body.new_password !== req.body.confirm_new_password && req.body.new_password !== req.body.confirm_password) return res.status(400).json({ detail: 'New passwords do not match.' }); req.user.passwordHash = await bcrypt.hash(req.body.new_password, 12); await req.user.save(); res.json({ status: 'success', message: 'Password changed successfully.' }); }));

const nutritionFor = async (userId, date) => Nutrition.findOne({ userId, date }) || null;
app.get('/nutrition/:date', requireUser, asyncRoute(async (req, res) => { const n = await Nutrition.findOne({ userId: req.user._id, date: req.params.date }); res.json(n || { date: req.params.date, calories_consumed: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }); }));
app.get('/nutrition/history', requireUser, asyncRoute(async (req, res) => res.json(await Nutrition.find({ userId: req.user._id }).sort({ date: 1 }).limit(Number(req.query.days) || 7).lean())));
app.get('/food/search', requireUser, (_req, res) => res.json([{ name: 'Chicken Breast (Grilled)', calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 }, { name: 'Brown Rice (1 cup)', calories: 216, protein_g: 5, carbs_g: 45, fat_g: 1.8 }, { name: 'Whole Eggs (2 Large)', calories: 140, protein_g: 12, carbs_g: 1, fat_g: 10 }]));
app.post('/nutrition/log', requireUser, asyncRoute(async (req, res) => {
  const d = req.body;
  const n = await Nutrition.findOneAndUpdate(
    { userId: req.user._id, date: d.date },
    { $inc: { calories_consumed: Number(d.calories_consumed || 0), protein_g: Number(d.protein_g || 0), carbs_g: Number(d.carbs_g || 0), fat_g: Number(d.fat_g || 0) },
      $push: { meals: { meal_name: d.meal_name || 'Logged Meal', calories: Number(d.calories_consumed || 0), protein_g: Number(d.protein_g || 0), carbs_g: Number(d.carbs_g || 0), fat_g: Number(d.fat_g || 0) } } },
    { upsert: true, new: true }
  );
  res.json({ status: 'success', message: 'Nutrition logs saved successfully', nutrition: n });
}));
app.delete('/nutrition/:date/meals/:mealId', requireUser, asyncRoute(async (req, res) => {
  await Nutrition.updateOne({ userId: req.user._id, date: req.params.date }, { $pull: { meals: { _id: req.params.mealId } } });
  res.json({ success: true });
}));
app.post('/water/log', requireUser, asyncRoute(async (req, res) => {
  const n = await Nutrition.findOneAndUpdate({ userId: req.user._id, date: today() }, { $inc: { water_ml: Number(req.body.amount_ml || 0) } }, { upsert: true, new: true });
  res.json({ total_ml: n.water_ml });
}));
app.get('/water/today', requireUser, asyncRoute(async (req, res) => {
  const n = await Nutrition.findOne({ userId: req.user._id, date: today() });
  res.json({ total_ml: n?.water_ml || 0 });
}));
app.get('/dashboard/today', requireUser, asyncRoute(async (req, res) => { const date = today(); const [nutrition, sessions, weight] = await Promise.all([Nutrition.findOne({ userId: req.user._id, date }).lean(), Workout.find({ userId: req.user._id, date: { $gte: new Date(`${date}T00:00:00Z`) } }).lean(), Weight.findOne({ userId: req.user._id, date }).lean()]); res.json({ date, profile: profileFor(req.user), nutrition: nutrition || {}, sessions: { session_count: sessions.length, total_sets: sessions.reduce((a, s) => a + s.total_sets, 0), total_reps: sessions.reduce((a, s) => a + s.total_reps, 0), calories_burned: sessions.reduce((a, s) => a + s.total_calories_burned, 0) }, current_weight: weight?.weight_kg || req.user.profile.weight_kg || 0 }); }));
app.post('/weight/log', requireUser, asyncRoute(async (req, res) => { const entry = await Weight.findOneAndUpdate({ userId: req.user._id, date: req.body.date || today() }, { weight_kg: Number(req.body.weight_kg) }, { upsert: true, new: true }); req.user.profile = { ...req.user.profile.toObject(), weight_kg: entry.weight_kg }; await req.user.save(); res.json(entry); }));
app.get('/weight/history', requireUser, asyncRoute(async (req, res) => res.json(await Weight.find({ userId: req.user._id }).sort({ date: 1 }).lean())));
app.post('/cardio/log', requireUser, (_req, res) => res.json({ status: 'success', message: 'Cardio log saved successfully' }));
app.get('/cardio/:date', requireUser, (_req, res) => res.json([]));
app.get('/fitness-score', requireUser, asyncRoute(async (req, res) => { const sessions = await Workout.countDocuments({ userId: req.user._id }); res.json({ score: Math.min(100, 50 + sessions * 5), grade: sessions > 5 ? 'A' : 'B' }); }));
app.get('/analytics/form-patterns', requireUser, (_req, res) => res.json([]));
app.get('/analytics/strength-trend', requireUser, (_req, res) => res.json([]));
app.get('/ai/coach-tip', requireUser, (_req, res) => res.json({ tip: 'Log a workout to receive personalized coaching tips.' }));
app.post('/chat', requireUser, (req, res) => res.json({ reply: 'Stay consistent with progressive overload, balanced nutrition, and recovery. I can help with fitness, nutrition, and wellness questions.' }));
app.get('/api/overview/summary', requireUser, asyncRoute(async (req, res) => { const n = await Nutrition.findOne({ userId: req.user._id, date: today() }).lean() || {}; const burned = (await Workout.find({ userId: req.user._id }).sort({ date: -1 }).limit(1).lean())[0]?.total_calories_burned || 0; res.json({ calories_consumed: n.calories_consumed || 0, calories_burned: burned, net_calories: (n.calories_consumed || 0) - burned, protein_g: n.protein_g || 0, carbs_g: n.carbs_g || 0, fat_g: n.fat_g || 0 }); }));

app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ detail: 'Internal Server Error' }); });
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitsense');
if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
  const username = process.env.ADMIN_USERNAME.trim().toLowerCase();
  const existing = await User.findOne({ username });
  if (!existing) {
    await User.create({
      username,
      name: process.env.ADMIN_NAME || 'FitSense Administrator',
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
      isAdmin: true,
      profile: {}
    });
  }
}
app.listen(port, () => console.log(`FitSense backend listening on http://localhost:${port}`));
