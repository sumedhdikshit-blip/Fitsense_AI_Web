import React, { useState, useEffect } from 'react';
import { workoutApi } from '../services/api';
import { Play, Edit } from 'lucide-react';

export const WorkoutPage = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [isHoldMode, setIsHoldMode] = useState(false);

  // Workout state
  const [workoutActive, setWorkoutActive] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [stage, setStage] = useState('--');
  const [formScore, setFormScore] = useState(100);
  const [feedback, setFeedback] = useState('Ready to begin workout set!');

  // Modals
  const [showLogSetModal, setShowLogSetModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Set Log Form
  const [modalReps, setModalReps] = useState(0);
  const [modalWeight, setModalWeight] = useState(0);
  const [rpe, setRpe] = useState(7);

  // Manual Form
  const [manualExercise, setManualExercise] = useState('');
  const [manualReps, setManualReps] = useState(10);
  const [manualWeight, setManualWeight] = useState(0);
  const [manualRpe, setManualRpe] = useState(7);

  // Session Summary
  const [summaryData, setSummaryData] = useState({ sets: 0, reps: 0, calories: 0, score: 100 });

  // Session tracking
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [completedSets, setCompletedSets] = useState([]);

  useEffect(() => {
    fetchExerciseLibrary();
  }, []);

  const fetchExerciseLibrary = async () => {
    try {
      const res = await workoutApi.getExercises();
      const list = res.data || [];
      setExercises(list);
      if (list.length > 0) {
        setSelectedExercise(list[0].key);
        setIsHoldMode(list[0].mode === 'hold');
      }
    } catch (err) {
      console.error('Error fetching exercises:', err);
    }
  };

  const handleExerciseChange = (e) => {
    const key = e.target.value;
    setSelectedExercise(key);
    const found = exercises.find(ex => ex.key === key);
    if (found) {
      setIsHoldMode(found.mode === 'hold');
    }
  };

  const startWorkout = () => {
    setWorkoutActive(true);
    setStage('In Progress');
    setFeedback(isHoldMode ? 'Hold position aligned!' : 'Performing active reps...');
  };

  const handleEndSet = () => {
    setModalReps(repCount > 0 ? repCount : (isHoldMode ? 30 : 10));
    setShowLogSetModal(true);
  };

  const handleSaveSet = async () => {
    try {
      const payload = {
        exercise_name: selectedExercise,
        reps: parseInt(modalReps),
        weight_kg: parseFloat(modalWeight) || 0,
        weight_mode: 'total',
        avg_form_score: formScore,
        session_id: currentSessionId,
        rpe: parseInt(rpe)
      };

      const res = await workoutApi.logSet(payload);
      if (res.data?.session_id) {
        setCurrentSessionId(res.data.session_id);
      }

      setCompletedSets(prev => [...prev, payload]);
      setShowLogSetModal(false);
      setRepCount(0);
      setFeedback('Set logged successfully! Ready for next set.');
    } catch (err) {
      console.error('Error logging set:', err);
    }
  };

  const handleSaveManual = async () => {
    try {
      const payload = {
        exercise_name: manualExercise || selectedExercise,
        reps: parseInt(manualReps),
        weight_kg: parseFloat(manualWeight) || 0,
        avg_form_score: 100,
        session_id: currentSessionId,
        rpe: parseInt(manualRpe)
      };

      const res = await workoutApi.logSet(payload);
      if (res.data?.session_id) {
        setCurrentSessionId(res.data.session_id);
      }

      const endRes = await workoutApi.endSession({
        session_id: res.data.session_id,
        notes: 'Manual Workout Log'
      });

      setSummaryData({
        sets: 1,
        reps: parseInt(manualReps),
        calories: endRes.data?.total_calories || 50,
        score: 100
      });

      setShowManualModal(false);
      setShowSummaryModal(true);
    } catch (err) {
      console.error('Error saving manual set:', err);
    }
  };

  const handleEndSession = async () => {
    if (!currentSessionId && completedSets.length === 0) {
      alert('No active set logged for this session yet.');
      return;
    }

    try {
      const res = await workoutApi.endSession({
        session_id: currentSessionId || 101,
        notes: 'Workout Session Complete'
      });

      setSummaryData({
        sets: completedSets.length || 1,
        reps: completedSets.reduce((a, b) => a + (b.reps || 0), 0) || 12,
        calories: res.data?.total_calories || 180,
        score: formScore
      });

      setWorkoutActive(false);
      setShowSummaryModal(true);
    } catch (err) {
      console.error('Error ending session:', err);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
      {/* Workout Controls Panel (Full Width) */}
      <div class="panel">
        <div class="panel-header">
          <h2>Workout Controls & Telemetry</h2>
          {workoutActive && <span class="badge badge-green">Session Active</span>}
        </div>

        <div class="control-group">
          <label>Select Exercise</label>
          <select class="form-select" value={selectedExercise} onChange={handleExerciseChange}>
            {exercises.map((ex) => (
              <option key={ex.key} value={ex.key}>
                {ex.display_name} ({ex.category})
              </option>
            ))}
          </select>
        </div>

        <div class="action-buttons">
          {!workoutActive ? (
            <button class="btn btn-success" onClick={startWorkout}>
              <Play size={16} /> Start Workout
            </button>
          ) : (
            <button class="btn btn-warning" onClick={handleEndSet}>
              End Set
            </button>
          )}

          <button class="btn btn-danger" onClick={handleEndSession} disabled={!workoutActive && completedSets.length === 0}>
            End Session
          </button>
          <button class="btn btn-secondary" onClick={() => setShowManualModal(true)}>
            <Edit size={16} /> Log Manual
          </button>
        </div>

        {/* Telemetry Display Cards */}
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">{isHoldMode ? 'HOLD TIME (S)' : 'REPS'}</span>
            <span class="stat-value" style={{ color: 'var(--accent-color)' }}>{repCount}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">STAGE</span>
            <span class="stat-value" style={{ fontSize: '1.5rem' }}>{stage}</span>
          </div>
        </div>

        {/* Form Score Bar */}
        <div class="form-score-section">
          <div class="form-score-header">
            <span>Session Form Score</span>
            <span class="score-green">{formScore}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar bar-green" style={{ width: `${formScore}%` }} />
          </div>
        </div>

        {/* Feedback Badges */}
        <div class="feedback-section">
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Real-time Feedback
          </h3>
          <div class="feedback-badge badge-green">{feedback}</div>
        </div>
      </div>

      {/* Log Completed Set Modal */}
      {showLogSetModal && (
        <div class="modal-overlay active">
          <div class="modal">
            <div class="modal-header">
              <h2>Log Completed Set</h2>
            </div>
            <div class="form-group">
              <label>Reps / Hold Time</label>
              <input
                type="number"
                class="form-input"
                value={modalReps}
                onChange={(e) => setModalReps(e.target.value)}
              />
            </div>
            <div class="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                class="form-input"
                value={modalWeight}
                onChange={(e) => setModalWeight(e.target.value)}
              />
            </div>
            <div class="form-group">
              <label>Rate of Perceived Exertion (RPE 1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={rpe}
                onChange={(e) => setRpe(e.target.value)}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rating: {rpe}/10</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button class="btn btn-success" style={{ flex: 1 }} onClick={handleSaveSet}>
                Save Set
              </button>
              <button class="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowLogSetModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Drawer/Modal */}
      {showManualModal && (
        <div class="modal-overlay active">
          <div class="modal">
            <div class="modal-header">
              <h2>Log Manual Workout</h2>
            </div>
            <div class="form-group">
              <label>Exercise</label>
              <select
                class="form-select"
                value={manualExercise || selectedExercise}
                onChange={(e) => setManualExercise(e.target.value)}
              >
                {exercises.map((ex) => (
                  <option key={ex.key} value={ex.key}>
                    {ex.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div class="form-group">
              <label>Reps</label>
              <input
                type="number"
                class="form-input"
                value={manualReps}
                onChange={(e) => setManualReps(e.target.value)}
              />
            </div>
            <div class="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                class="form-input"
                value={manualWeight}
                onChange={(e) => setManualWeight(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button class="btn btn-success" style={{ flex: 1 }} onClick={handleSaveManual}>
                Log Workout
              </button>
              <button class="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowManualModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Finalization Summary Modal */}
      {showSummaryModal && (
        <div class="modal-overlay active">
          <div class="modal" style={{ textAlign: 'center' }}>
            <div class="modal-header">
              <h2>Workout Session Completed! 🎉</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '20px 0' }}>
              <div class="stat-card">
                <span class="stat-label">TOTAL SETS</span>
                <span class="stat-value">{summaryData.sets}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">CALORIES BURNED</span>
                <span class="stat-value" style={{ color: 'var(--color-green)' }}>{summaryData.calories} kcal</span>
              </div>
            </div>
            <button
              class="btn btn-success"
              style={{ width: '100%' }}
              onClick={() => {
                setShowSummaryModal(false);
                setCurrentSessionId(null);
                setCompletedSets([]);
              }}
            >
              Done & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
