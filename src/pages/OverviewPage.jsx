import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { trackingApi, overviewApi, profileApi } from '../services/api';
import { Scale, Flame, Activity, ShieldAlert, Award, Dumbbell, Calendar, ChevronRight, Plus, RefreshCw } from 'lucide-react';

export const OverviewPage = () => {
  const { user, profile, refreshUser } = useAuth();
  const [weightDays, setWeightDays] = useState('7');
  const [weightHistory, setWeightHistory] = useState([]);
  const [todaySummary, setTodaySummary] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [fatigueWarnings, setFatigueWarnings] = useState([]);
  const [coachTip, setCoachTip] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [readiness, setReadiness] = useState(null);

  // Modals
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showCardioModal, setShowCardioModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Forms
  const [weightInput, setWeightInput] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);

  // Food Form
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProtein, setFoodProtein] = useState('0');
  const [foodCarbs, setFoodCarbs] = useState('0');
  const [foodFat, setFoodFat] = useState('0');

  // Cardio Form
  const [cardioType, setCardioType] = useState('Running');
  const [cardioValue, setCardioValue] = useState('');

  // Goal Form
  const [targetWeight, setTargetWeight] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [weightDays]);

  const loadDashboardData = async () => {
    try {
      const [weightRes, summaryRes, sessionsRes, fatigueRes, coachRes, streakRes, readinessRes] = await Promise.allSettled([
        trackingApi.getWeightHistory(weightDays),
        overviewApi.getSummary(),
        overviewApi.getRecentSessions(),
        overviewApi.getFatigueWarnings(),
        overviewApi.getAiCoaching(),
        overviewApi.getStreak(),
        overviewApi.getReadiness()
      ]);

      if (weightRes.status === 'fulfilled') setWeightHistory(weightRes.value.data || []);
      if (summaryRes.status === 'fulfilled') setTodaySummary(summaryRes.value.data || null);
      if (sessionsRes.status === 'fulfilled') setRecentSessions(sessionsRes.value.data || []);
      if (fatigueRes.status === 'fulfilled') setFatigueWarnings(fatigueRes.value.data || []);
      if (coachRes.status === 'fulfilled') setCoachTip(coachRes.value.data?.tip || null);
      if (streakRes.status === 'fulfilled') setStreakData(streakRes.value.data || null);
      if (readinessRes.status === 'fulfilled') setReadiness(readinessRes.value.data || null);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const handleSaveWeight = async () => {
    if (!weightInput) return;
    try {
      await trackingApi.logWeight({
        weight_kg: parseFloat(weightInput),
        date: weightDate
      });
      setShowWeightModal(false);
      setWeightInput('');
      loadDashboardData();
      refreshUser();
    } catch (err) {
      console.error('Error saving weight:', err);
    }
  };

  const handleSaveFood = async () => {
    if (!foodCalories) return;
    try {
      await trackingApi.logMeal({
        meal_name: foodName || 'Logged Meal',
        calories: parseFloat(foodCalories),
        protein_g: parseFloat(foodProtein) || 0,
        carbs_g: parseFloat(foodCarbs) || 0,
        fat_g: parseFloat(foodFat) || 0
      });
      setShowFoodModal(false);
      setFoodName('');
      setFoodCalories('');
      loadDashboardData();
    } catch (err) {
      console.error('Error logging food:', err);
    }
  };

  const handleSaveGoal = async () => {
    if (!targetWeight) return;
    try {
      await profileApi.updateWeightGoal({
        target_weight_kg: parseFloat(targetWeight)
      });
      setShowGoalModal(false);
      setTargetWeight('');
      refreshUser();
    } catch (err) {
      console.error('Error saving goal:', err);
    }
  };

  const handleSaveCardio = async () => {
    if (!cardioValue) return;
    try {
      await trackingApi.logCardio({
        date: new Date().toISOString().slice(0, 10),
        activity_name: cardioType,
        duration_mins: parseFloat(cardioValue),
        calories_burned: Math.round(parseFloat(cardioValue) * 8),
        entry_method: 'duration'
      });
      setCardioValue('');
      setShowCardioModal(false);
      loadDashboardData();
    } catch (err) {
      console.error('Error logging cardio:', err);
    }
  };

  const currentWeight = profile?.weight_kg || 75.0;
  const currentHeight = profile?.height_cm || 175;
  const bmi = (currentWeight / Math.pow(currentHeight / 100, 2)).toFixed(1);

  const getBmiCategory = (bmiVal) => {
    const num = parseFloat(bmiVal);
    if (num < 18.5) return { text: 'Underweight', color: 'var(--color-yellow)' };
    if (num < 25.0) return { text: 'Normal Weight', color: 'var(--color-green)' };
    if (num < 30.0) return { text: 'Overweight', color: 'var(--color-orange)' };
    return { text: 'Obese', color: 'var(--color-red)' };
  };

  const bmiCat = getBmiCategory(bmi);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Fatigue Warning Banner */}
      {fatigueWarnings.length > 0 && (
        <div className="setup-banner" style={{ background: 'var(--color-red)', color: '#fff' }}>
          <div className="setup-banner-content">
            <ShieldAlert size={20} />
            <span>
              <strong>Fatigue Alert:</strong> High strain detected in recent sessions ({fatigueWarnings.join(', ')}). Consider a deload or extra recovery today.
            </span>
          </div>
        </div>
      )}

      {/* Main 2-Column Dashboard Board */}
      <div className="dashboard-grid">
        {/* Left Column: Weight History & Goal */}
        <div className="panel">
          <div className="panel-header">
            <h2>Weight History</h2>
            <div className="range-selector" style={{ display: 'flex', gap: '4px' }}>
              {['7', '30', '90', 'all'].map(d => (
                <button
                  key={d}
                  className={`btn btn-sm btn-range${weightDays === d ? ' active' : ''}`}
                  onClick={() => setWeightDays(d)}
                >
                  {d === 'all' ? 'ALL' : `${d}D`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '15px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <div className="stat-card">
                <span className="stat-label">Body Mass Index (BMI)</span>
                <span className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--color-blue)' }}>{bmi}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Weight Status</span>
                <span className="stat-value" style={{ fontSize: '1.2rem', color: bmiCat.color }}>{bmiCat.text}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--pill-bg)', padding: '12px 16px', borderRadius: '10px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>CURRENT WEIGHT</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>{currentWeight} kg</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowWeightModal(true)}>
                <Scale size={14} /> Log Weight
              </button>
            </div>
          </div>

          {/* Goal Section */}
          <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '8px' }}>
            {profile?.target_weight_kg ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-blue">TARGET GOAL</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Target: {profile.target_weight_kg} kg</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Diff: {(currentWeight - profile.target_weight_kg).toFixed(1)} kg remaining
                </div>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: '8px', width: '100%' }} onClick={() => setShowGoalModal(true)}>
                  Edit Goal
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  No target weight set.
                </span>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowGoalModal(true)}>
                  Set Target Goal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Daily Calorie Balance */}
        <div className="panel">
          <div className="panel-header">
            <h2>Daily Calorie Balance</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowFoodModal(true)}>
                <Plus size={14} /> Log Food
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCardioModal(true)}>
                <Activity size={14} /> Log Cardio
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
            <span style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--color-green)' }}>
              {todaySummary?.net_calories || 0}
            </span>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>
              NET CALORIES TODAY
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="stat-card">
              <span className="stat-label">CONSUMED</span>
              <span className="stat-value" style={{ fontSize: '1.4rem', color: '#ffb74d' }}>
                {todaySummary?.calories_consumed || 0} kcal
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">BURNED</span>
              <span className="stat-value" style={{ fontSize: '1.4rem', color: '#4fc3f7' }}>
                {todaySummary?.calories_burned || 0} kcal
              </span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Recent Weight Entries</h2>
            <span className="badge badge-blue">{weightHistory.length} records</span>
          </div>
          {weightHistory.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No weight entries for this range.</p>
          ) : (
            <div className="weight-history-list">
              {weightHistory.slice(-7).reverse().map((entry) => (
                <div className="weight-history-row" key={`${entry.date}-${entry.weight_kg}`}>
                  <span>{entry.date}</span>
                  <strong>{entry.weight_kg} kg</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Readiness & Coaching Section */}
      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>AI Readiness & Recovery</h2>
            <span className="badge badge-blue">Whoop Telemetry</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', border: '6px solid var(--color-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800 }}>
              {readiness?.readiness ?? '--'}%
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{readiness?.label || 'Readiness unavailable'}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Your muscle strain indicators show high readiness for intensive compound training.
              </p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>AI Coach Tip</h2>
            <Award size={18} color="var(--accent-color)" />
          </div>
          <p style={{ fontSize: '0.92rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
            {coachTip || "Focus on progressive overload today. Keep your rest periods between 90-120 seconds for optimal hypertrophy."}
          </p>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="panel">
        <div className="panel-header">
          <h2>Recent Workout Sessions</h2>
        </div>
        {recentSessions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent workout sessions recorded.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentSessions.slice(0, 5).map((s, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--pill-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.95rem', display: 'block' }}>{s.exercise_name || 'Workout Session'}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.date || 'Recent'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                    {s.total_reps || 0} reps / {s.calories_burned || 0} kcal
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Weight Modal */}
      {showWeightModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h2>Log Weight Entry</h2>
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="e.g. 75.5"
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-input"
                value={weightDate}
                onChange={(e) => setWeightDate(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-success" style={{ flex: 1 }} onClick={handleSaveWeight}>
                Save Weight
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowWeightModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Food Modal */}
      {showFoodModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h2>Log Food & Nutrition</h2>
            </div>
            <div className="form-group">
              <label>Meal Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Grilled Chicken & Rice"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Calories (kcal)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 550"
                value={foodCalories}
                onChange={(e) => setFoodCalories(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group col-4">
                <label>Protein (g)</label>
                <input
                  type="number"
                  className="form-input"
                  value={foodProtein}
                  onChange={(e) => setFoodProtein(e.target.value)}
                />
              </div>
              <div className="form-group col-4">
                <label>Carbs (g)</label>
                <input
                  type="number"
                  className="form-input"
                  value={foodCarbs}
                  onChange={(e) => setFoodCarbs(e.target.value)}
                />
              </div>
              <div className="form-group col-4">
                <label>Fat (g)</label>
                <input
                  type="number"
                  className="form-input"
                  value={foodFat}
                  onChange={(e) => setFoodFat(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-success" style={{ flex: 1 }} onClick={handleSaveFood}>
                Save Meal Log
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowFoodModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCardioModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header"><h2>Log Cardio</h2></div>
            <div className="form-group">
              <label>Activity</label>
              <input className="form-input" value={cardioType} onChange={(e) => setCardioType(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input type="number" min="0" className="form-input" value={cardioValue} onChange={(e) => setCardioValue(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-success" style={{ flex: 1 }} onClick={handleSaveCardio}>Save Cardio</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCardioModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Target Modal */}
      {showGoalModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h2>Set Weight Target Goal</h2>
            </div>
            <div className="form-group">
              <label>Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="e.g. 70.0"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-success" style={{ flex: 1 }} onClick={handleSaveGoal}>
                Save Target Goal
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowGoalModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
