import React, { useState, useEffect } from 'react';
import { overviewApi } from '../services/api';
import { Calendar, Eye, Activity, Award } from 'lucide-react';

export const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Detail Modal State
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await overviewApi.getRecentSessions();
      setSessions(res.data || []);
    } catch (err) {
      console.error('Error fetching sessions history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (sessionId) => {
    try {
      const res = await overviewApi.getSessionDetails(sessionId);
      setSelectedSession(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching session details:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="panel">
        <div className="panel-header">
          <h2>Workout History Log</h2>
          <span className="badge badge-blue">Telemetry Log</span>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
            Querying workout session history...
          </p>
        ) : sessions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
            No sessions recorded yet — start a workout to see your stats here!
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Exercises Done</th>
                <th>Total Sets</th>
                <th>Total Reps / Hold</th>
                <th>Calories Burned</th>
                <th>Avg Form Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((sess) => {
                const dateStr = new Date(sess.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });

                const isScoreGreen = sess.avg_form_score >= 75;
                const isScoreYellow = sess.avg_form_score >= 50 && sess.avg_form_score < 75;

                return (
                  <tr key={sess.session_id}>
                    <td>{dateStr}</td>
                    <td><strong>{sess.exercises_done || 'Workout Session'}</strong></td>
                    <td>{sess.total_sets}</td>
                    <td>{sess.total_reps}</td>
                    <td>{sess.total_calories_burned ? `${sess.total_calories_burned.toFixed(1)} kcal` : '0 kcal'}</td>
                    <td>
                      <span className={isScoreGreen ? 'score-green' : isScoreYellow ? 'score-yellow' : 'score-red'}>
                        {Math.round(sess.avg_form_score)}%
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewDetail(sess.session_id)}
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Session Details Modal */}
      {showDetailModal && selectedSession && (
        <div className="modal-overlay active">
          <div className="modal" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2>Session Details #{selectedSession.session_id}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div className="stat-card">
                <span className="stat-label">DURATION</span>
                <span className="stat-value" style={{ fontSize: '1.2rem' }}>
                  {selectedSession.total_duration_mins ? `${selectedSession.total_duration_mins.toFixed(1)}m` : 'N/A'}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">CALORIES</span>
                <span className="stat-value" style={{ fontSize: '1.2rem', color: 'var(--color-green)' }}>
                  {selectedSession.total_calories_burned ? `${selectedSession.total_calories_burned.toFixed(1)}` : '0'} kcal
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">FORM SCORE</span>
                <span className="stat-value" style={{ fontSize: '1.2rem', color: 'var(--color-blue)' }}>
                  {Math.round(selectedSession.avg_form_score)}%
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Session Notes:</strong>
              <p style={{ fontSize: '0.9rem', background: 'var(--pill-bg)', padding: '10px', borderRadius: '6px', marginTop: '4px' }}>
                {selectedSession.notes || 'No notes added.'}
              </p>
            </div>

            <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Completed Sets Breakdowns
            </h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Set #</th>
                  <th>Exercise</th>
                  <th>Reps</th>
                  <th>Weight</th>
                  <th>RPE</th>
                  <th>Form</th>
                </tr>
              </thead>
              <tbody>
                {selectedSession.exercises?.flatMap((ex) =>
                  ex.sets?.map((set) => (
                    <tr key={`${ex.exercise_key}-${set.set_number}`}>
                      <td>Set {set.set_number}</td>
                      <td><strong>{ex.exercise_name}</strong></td>
                      <td>{set.reps_counted}</td>
                      <td>{set.weight_kg} kg</td>
                      <td>{set.rpe}</td>
                      <td>{Math.round(set.avg_form_score)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
