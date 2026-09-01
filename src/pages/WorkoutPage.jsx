import React, { useState, useEffect, useRef } from 'react';
import { workoutApi } from '../services/api';
import { Camera, Play, CheckCircle, XCircle, Edit, Activity, Sliders, AlertTriangle } from 'lucide-react';

export const WorkoutPage = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [isHoldMode, setIsHoldMode] = useState(false);

  // Workout state
  const [workoutActive, setWorkoutActive] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [stage, setStage] = useState('--');
  const [formScore, setFormScore] = useState(100);
  const [feedback, setFeedback] = useState('Ready to begin!');
  const [jointAngles, setJointAngles] = useState({});
  const [streamStatus, setStreamStatus] = useState('Disconnected');

  // Modals
  const [showLogSetModal, setShowLogSetModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Set Log Form
  const [modalReps, setModalReps] = useState(0);
  const [modalWeight, setModalWeight] = useState(0);
  const [weightUnit, setWeightUnit] = useState('kg');
  const [weightMode, setWeightMode] = useState('total');
  const [setDuration, setSetDuration] = useState('');
  const [rpe, setRpe] = useState(7);
  const [hasPain, setHasPain] = useState(false);
  const [painLocation, setPainLocation] = useState('');

  // Manual Form
  const [manualExercise, setManualExercise] = useState('');
  const [manualReps, setManualReps] = useState(10);
  const [manualWeight, setManualWeight] = useState(0);
  const [manualRpe, setManualRpe] = useState(7);

  // Session Summary
  const [summaryData, setSummaryData] = useState({ sets: 0, reps: 0, calories: 0, score: 100 });
  const [sessionNotes, setSessionNotes] = useState('');

  // Session tracking
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [completedSets, setCompletedSets] = useState([]);

  // Media / WS refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchExerciseLibrary();
    return () => {
      stopCameraAndWs();
    };
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

  const startWorkout = async () => {
    try {
      setStreamStatus('Connecting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setStreamStatus('Connecting Server...');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/workout`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setStreamStatus('Streaming Live');
        setWorkoutActive(true);

        // Frame capture loop
        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = 320;
        captureCanvas.height = 240;
        const capCtx = captureCanvas.getContext('2d');

        intervalRef.current = setInterval(() => {
          if (videoRef.current && ws.readyState === WebSocket.OPEN) {
            capCtx.drawImage(videoRef.current, 0, 0, 320, 240);
            const frameData = captureCanvas.toDataURL('image/jpeg', 0.6);
            ws.send(JSON.stringify({
              frame: frameData,
              exercise: selectedExercise,
              current_reps: repCount
            }));
          }
        }, 150);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.reps !== undefined) setRepCount(data.reps);
          if (data.stage) setStage(data.stage);
          if (data.form_score !== undefined) setFormScore(Math.round(data.form_score));
          if (data.feedback) setFeedback(data.feedback);
          if (data.angles) setJointAngles(data.angles);

          if (data.frame && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
            };
            img.src = `data:image/jpeg;base64,${data.frame}`;
          }
        } catch (e) {
          console.error('Error processing WS frame data:', e);
        }
      };

      ws.onclose = () => {
        setStreamStatus('Disconnected');
      };

      socketRef.current = ws;
    } catch (err) {
      console.error('Camera access error:', err);
      setStreamStatus('Camera Permission Denied');
    }
  };

  const stopCameraAndWs = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (socketRef.current) socketRef.current.close();
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setWorkoutActive(false);
    setStreamStatus('Disconnected');
  };

  const handleEndSet = () => {
    setModalReps(repCount);
    setShowLogSetModal(true);
  };

  const handleSaveSet = async () => {
    try {
      const payload = {
        exercise_name: selectedExercise,
        reps: parseInt(modalReps),
        weight_kg: parseFloat(modalWeight) || 0,
        weight_mode: weightMode,
        avg_form_score: formScore,
        session_id: currentSessionId,
        rpe: parseInt(rpe),
        pain_reported: hasPain,
        pain_location: hasPain ? painLocation : null
      };

      const res = await workoutApi.logSet(payload);
      if (res.data?.session_id) {
        setCurrentSessionId(res.data.session_id);
      }

      setCompletedSets(prev => [...prev, payload]);
      setShowLogSetModal(false);
      setRepCount(0);
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
    stopCameraAndWs();
    if (!currentSessionId) {
      alert('No active set logged for this session yet.');
      return;
    }

    try {
      const res = await workoutApi.endSession({
        session_id: currentSessionId,
        notes: sessionNotes
      });

      setSummaryData({
        sets: completedSets.length,
        reps: completedSets.reduce((a, b) => a + (b.reps || 0), 0),
        calories: res.data?.total_calories || 0,
        score: formScore
      });

      setShowSummaryModal(true);
    } catch (err) {
      console.error('Error ending session:', err);
    }
  };

  return (
    <div class="dashboard-grid">
      {/* Left Panel: Camera Live Stream */}
      <div class="panel">
        <div class="panel-header">
          <h2>Live Stream</h2>
          <span class="badge badge-blue">{streamStatus}</span>
        </div>
        <div class="canvas-wrapper">
          <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
          <canvas ref={canvasRef} width={640} height={480} />
          {!workoutActive && (
            <div class="canvas-placeholder">
              <Camera size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
              <p>Click "Start Workout" to enable AI Pose Camera</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Controls & Telemetry */}
      <div class="panel">
        <div class="panel-header">
          <h2>Workout Controls</h2>
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

          <button class="btn btn-danger" onClick={handleEndSession} disabled={!currentSessionId}>
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

        {/* Live Joint Angles */}
        {Object.keys(jointAngles).length > 0 && (
          <div class="angles-section" style={{ marginTop: '15px' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Joint Angles
            </h3>
            <div class="angles-grid">
              {Object.entries(jointAngles).map(([joint, angle]) => (
                <div key={joint} class="angle-item">
                  <span>{joint.replace('_', ' ')}</span>
                  <strong>{Math.round(angle)}°</strong>
                </div>
              ))}
            </div>
          </div>
        )}
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
