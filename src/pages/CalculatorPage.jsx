import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { trackingApi } from '../services/api';
import { Calculator, Utensils, Droplets, Scale, Plus, Trash2, Search } from 'lucide-react';

export const CalculatorPage = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('bmr');

  // Calculator Form State
  const [weight, setWeight] = useState(profile?.weight_kg || 75);
  const [height, setHeight] = useState(profile?.height_cm || 175);
  const [age, setAge] = useState(profile?.age || 25);
  const [gender, setGender] = useState(profile?.sex?.toLowerCase() === 'female' ? 'female' : 'male');
  const [activity, setActivity] = useState(1.375); // Lightly active
  const [goal, setGoal] = useState('maintain'); // cut, maintain, bulk

  // Calculation Results
  const [results, setResults] = useState(null);

  // Meal Tracker State
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealList, setMealList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newMealName, setNewMealName] = useState('');
  const [newMealCalories, setNewMealCalories] = useState('');
  const [newMealProtein, setNewMealProtein] = useState('0');
  const [newMealCarbs, setNewMealCarbs] = useState('0');
  const [newMealFat, setNewMealFat] = useState('0');

  // Water Tracker State
  const [waterIntake, setWaterIntake] = useState(0);

  // Weight History State
  const [weightHistory, setWeightHistory] = useState([]);

  useEffect(() => {
    if (profile) {
      if (profile.weight_kg) setWeight(profile.weight_kg);
      if (profile.height_cm) setHeight(profile.height_cm);
      if (profile.age) setAge(profile.age);
      if (profile.sex) setGender(profile.sex.toLowerCase() === 'female' ? 'female' : 'male');
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'meals') loadDailyMealLog();
    if (activeTab === 'water') loadTodayWater();
    if (activeTab === 'weight') loadWeightHistory();
  }, [activeTab, mealDate]);

  const calculateBmrTdee = (e) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    const bmi = w / Math.pow(h / 100, 2);

    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    const tdee = bmr * parseFloat(activity);

    let targetCal = tdee;
    if (goal === 'cut') targetCal = tdee - 500;
    if (goal === 'bulk') targetCal = tdee + 400;

    const proteinG = Math.round(w * 2.0); // 2g per kg
    const fatG = Math.round((targetCal * 0.25) / 9);
    const carbsG = Math.round((targetCal - (proteinG * 4 + fatG * 9)) / 4);

    setResults({
      bmi: bmi.toFixed(1),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCal),
      proteinG,
      carbsG,
      fatG
    });
  };

  const loadDailyMealLog = async () => {
    try {
      const res = await trackingApi.getDailyMealLog(mealDate);
      setMealList(res.data?.meals || []);
    } catch (err) {
      console.error('Error loading meal log:', err);
    }
  };

  const loadTodayWater = async () => {
    try {
      const res = await trackingApi.getTodayWater();
      setWaterIntake(res.data?.total_ml || 0);
    } catch (err) {
      console.error('Error loading water log:', err);
    }
  };

  const loadWeightHistory = async () => {
    try {
      const res = await trackingApi.getWeightHistory('30');
      setWeightHistory(res.data || []);
    } catch (err) {
      console.error('Error loading weight history:', err);
    }
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!newMealCalories) return;
    try {
      await trackingApi.logMeal({
        meal_name: newMealName || 'Logged Meal',
        calories: parseFloat(newMealCalories),
        protein_g: parseFloat(newMealProtein) || 0,
        carbs_g: parseFloat(newMealCarbs) || 0,
        fat_g: parseFloat(newMealFat) || 0
      });
      setNewMealName('');
      setNewMealCalories('');
      setNewMealProtein('0');
      setNewMealCarbs('0');
      setNewMealFat('0');
      loadDailyMealLog();
    } catch (err) {
      console.error('Error adding meal:', err);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      await trackingApi.deleteMeal(mealId);
      loadDailyMealLog();
    } catch (err) {
      console.error('Error deleting meal:', err);
    }
  };

  const handleAddWater = async (amountMl) => {
    try {
      const res = await trackingApi.logWater(amountMl);
      setWaterIntake(res.data?.total_ml || waterIntake + amountMl);
    } catch (err) {
      console.error('Error logging water:', err);
    }
  };

  const totalMealCalories = mealList.reduce((acc, m) => acc + (m.calories || 0), 0);
  const totalProtein = mealList.reduce((acc, m) => acc + (m.protein_g || 0), 0);
  const totalCarbs = mealList.reduce((acc, m) => acc + (m.carbs_g || 0), 0);
  const totalFat = mealList.reduce((acc, m) => acc + (m.fat_g || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub-Navigation Tabs */}
      <div class="panel" style={{ padding: '12px 20px', flexDirection: 'row', gap: '10px' }}>
        <button
          class={`btn btn-secondary ${activeTab === 'bmr' ? 'btn-success' : ''}`}
          onClick={() => setActiveTab('bmr')}
        >
          <Calculator size={16} /> BMR & TDEE Calculator
        </button>
        <button
          class={`btn btn-secondary ${activeTab === 'meals' ? 'btn-success' : ''}`}
          onClick={() => setActiveTab('meals')}
        >
          <Utensils size={16} /> Meal Tracker
        </button>
        <button
          class={`btn btn-secondary ${activeTab === 'water' ? 'btn-success' : ''}`}
          onClick={() => setActiveTab('water')}
        >
          <Droplets size={16} /> Water Intake
        </button>
        <button
          class={`btn btn-secondary ${activeTab === 'weight' ? 'btn-success' : ''}`}
          onClick={() => setActiveTab('weight')}
        >
          <Scale size={16} /> Weight History
        </button>
      </div>

      {/* Tab 1: BMR & TDEE Calculator */}
      {activeTab === 'bmr' && (
        <div class="dashboard-grid">
          <div class="panel">
            <div class="panel-header">
              <h2>BMR & TDEE Calculator</h2>
            </div>
            <form onSubmit={calculateBmrTdee}>
              <div class="form-row">
                <div class="form-group col-6">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    class="form-input"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                </div>
                <div class="form-group col-6">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    class="form-input"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group col-6">
                  <label>Age</label>
                  <input
                    type="number"
                    class="form-input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
                <div class="form-group col-6">
                  <label>Sex</label>
                  <select class="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Activity Level</label>
                <select class="form-select" value={activity} onChange={(e) => setActivity(e.target.value)}>
                  <option value="1.2">Sedentary (Little or no exercise)</option>
                  <option value="1.375">Lightly Active (1-3 days/week)</option>
                  <option value="1.55">Moderately Active (3-5 days/week)</option>
                  <option value="1.725">Very Active (6-7 days/week)</option>
                  <option value="1.9">Extra Active (Hard physical job/training)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Fitness Goal</label>
                <select class="form-select" value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="cut">Fat Loss (-500 kcal Deficit)</option>
                  <option value="maintain">Maintenance (Keep Weight)</option>
                  <option value="bulk">Muscle Gain (+400 kcal Surplus)</option>
                </select>
              </div>

              <button type="submit" class="btn btn-success" style={{ width: '100%', marginTop: '10px' }}>
                Calculate Target Telemetry
              </button>
            </form>
          </div>

          <div class="panel">
            <div class="panel-header">
              <h2>Calculated Results</h2>
            </div>
            {results ? (
              <div>
                <div class="stats-grid">
                  <div class="stat-card">
                    <span class="stat-label">BMR</span>
                    <span class="stat-value">{results.bmr} kcal</span>
                  </div>
                  <div class="stat-card">
                    <span class="stat-label">TDEE</span>
                    <span class="stat-value" style={{ color: 'var(--color-blue)' }}>{results.tdee} kcal</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', background: 'var(--pill-bg)', padding: '16px', borderRadius: '10px', margin: '15px 0' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>RECOMMENDED DAILY TARGET</span>
                  <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-green)', display: 'block' }}>
                    {results.targetCalories} kcal
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div class="stat-card">
                    <span class="stat-label">PROTEIN</span>
                    <span class="stat-value" style={{ fontSize: '1.2rem' }}>{results.proteinG}g</span>
                  </div>
                  <div class="stat-card">
                    <span class="stat-label">CARBS</span>
                    <span class="stat-value" style={{ fontSize: '1.2rem' }}>{results.carbsG}g</span>
                  </div>
                  <div class="stat-card">
                    <span class="stat-label">FAT</span>
                    <span class="stat-value" style={{ fontSize: '1.2rem' }}>{results.fatG}g</span>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Enter your details and click Calculate to view results.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Meal Tracker */}
      {activeTab === 'meals' && (
        <div class="dashboard-grid">
          <div class="panel">
            <div class="panel-header">
              <h2>Log Custom Meal</h2>
            </div>
            <form onSubmit={handleAddMeal}>
              <div class="form-group">
                <label>Meal Description</label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="e.g. Protein Shake & Oats"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                />
              </div>
              <div class="form-group">
                <label>Calories (kcal)</label>
                <input
                  type="number"
                  class="form-input"
                  placeholder="e.g. 450"
                  value={newMealCalories}
                  onChange={(e) => setNewMealCalories(e.target.value)}
                  required
                />
              </div>
              <div class="form-row">
                <div class="form-group col-4">
                  <label>Protein (g)</label>
                  <input
                    type="number"
                    class="form-input"
                    value={newMealProtein}
                    onChange={(e) => setNewMealProtein(e.target.value)}
                  />
                </div>
                <div class="form-group col-4">
                  <label>Carbs (g)</label>
                  <input
                    type="number"
                    class="form-input"
                    value={newMealCarbs}
                    onChange={(e) => setNewMealCarbs(e.target.value)}
                  />
                </div>
                <div class="form-group col-4">
                  <label>Fat (g)</label>
                  <input
                    type="number"
                    class="form-input"
                    value={newMealFat}
                    onChange={(e) => setNewMealFat(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" class="btn btn-success" style={{ width: '100%', marginTop: '10px' }}>
                Add Meal Log
              </button>
            </form>
          </div>

          <div class="panel">
            <div class="panel-header">
              <h2>Daily Log ({mealDate})</h2>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div class="stat-card" style={{ flex: 1 }}>
                <span class="stat-label">TOTAL CALORIES</span>
                <span class="stat-value" style={{ fontSize: '1.4rem', color: 'var(--color-green)' }}>{totalMealCalories} kcal</span>
              </div>
            </div>

            {mealList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No meals logged for this date.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {mealList.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'var(--pill-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{m.meal_name}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        P: {m.protein_g}g | C: {m.carbs_g}g | F: {m.fat_g}g
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 700 }}>{m.calories} kcal</span>
                      <button
                        class="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={() => handleDeleteMeal(m.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Water Intake */}
      {activeTab === 'water' && (
        <div class="panel" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
          <div class="panel-header">
            <h2>Daily Water Hydration Tracker</h2>
          </div>
          <div style={{ padding: '30px 0' }}>
            <Droplets size={64} color="var(--color-blue)" style={{ marginBottom: '15px' }} />
            <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-blue)', display: 'block' }}>
              {waterIntake} / 2500 ml
            </span>
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden', margin: '20px 0' }}>
              <div
                style={{
                  width: `${Math.min(100, (waterIntake / 2500) * 100)}%`,
                  height: '100%',
                  background: 'var(--color-blue)',
                  transition: 'width 0.3s'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button class="btn btn-secondary" onClick={() => handleAddWater(250)}>
                + 250 ml (Glass)
              </button>
              <button class="btn btn-secondary" onClick={() => handleAddWater(500)}>
                + 500 ml (Bottle)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Weight History */}
      {activeTab === 'weight' && (
        <div class="panel">
          <div class="panel-header">
            <h2>Logged Weight History</h2>
          </div>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight (kg)</th>
                <th>Body Fat (%)</th>
              </tr>
            </thead>
            <tbody>
              {weightHistory.length === 0 ? (
                <tr>
                  <td colSpan="3" class="table-loading">No weight records found.</td>
                </tr>
              ) : (
                weightHistory.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.date}</td>
                    <td><strong>{item.weight_kg} kg</strong></td>
                    <td>{item.body_fat_pct ? `${item.body_fat_pct}%` : '--'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
