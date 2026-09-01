import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';
import { User, Shield, Lock, Save, AlertCircle } from 'lucide-react';

export const ProfilePage = () => {
  const { profile, refreshUser } = useAuth();

  // Profile fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('');

  // Additional parameters
  const [smoker, setSmoker] = useState('no');
  const [sleepHours, setSleepHours] = useState('');
  const [stressLevel, setStressLevel] = useState('3');
  const [exerciseFreq, setExerciseFreq] = useState('moderate');
  const [dietQuality, setDietQuality] = useState('good');
  const [alcohol, setAlcohol] = useState('none');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Status banners
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAge(profile.age || '');
      setSex(profile.sex || 'male');
      setWeight(profile.weight_kg || '');
      setHeight(profile.height_cm || '');
      setGoal(profile.fitness_goal || '');

      setSmoker(profile.smoker || 'no');
      setSleepHours(profile.sleep_hours !== null && profile.sleep_hours !== undefined ? profile.sleep_hours : '');
      setStressLevel(profile.stress_level !== null && profile.stress_level !== undefined ? profile.stress_level : '3');
      setExerciseFreq(profile.exercise_freq || 'moderate');
      setDietQuality(profile.diet_quality || 'good');
      setAlcohol(profile.alcohol_consumption || 'none');
    }
  }, [profile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');

    try {
      const payload = {
        name: name || 'Athlete',
        age: parseInt(age) || 0,
        weight_kg: parseFloat(weight) || 0,
        height_cm: parseFloat(height) || 0,
        sex,
        fitness_goal: goal,
        smoker,
        sleep_hours: sleepHours !== '' ? parseFloat(sleepHours) : null,
        stress_level: stressLevel !== '' ? parseInt(stressLevel) : null,
        exercise_freq: exerciseFreq,
        diet_quality: dietQuality,
        alcohol_consumption: alcohol
      };

      await profileApi.updateProfile(payload);
      await refreshUser();
      setProfileMsg('Profile settings updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      const detail = err.response?.data?.detail || 'Failed to update profile settings.';
      setProfileError(detail);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await profileApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmNewPassword
      });

      setPasswordMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      const detail = err.response?.data?.detail || 'Failed to update password.';
      setPasswordError(detail);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {/* Profile Details Card */}
      <div class="panel">
        <div class="panel-header">
          <h2>Athlete Profile & Physical Telemetry</h2>
        </div>

        {profileMsg && (
          <div class="feedback-badge badge-green" style={{ marginBottom: '15px' }}>
            {profileMsg}
          </div>
        )}
        {profileError && (
          <div class="feedback-badge badge-red" style={{ marginBottom: '15px' }}>
            {profileError}
          </div>
        )}

        <form onSubmit={handleSaveProfile}>
          <div class="form-group">
            <label>Full Name</label>
            <input
              type="text"
              class="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              <select class="form-select" value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Unspecified</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Primary Fitness Goal</label>
            <input
              type="text"
              class="form-input"
              placeholder="e.g. Build Muscle & Improve Bench Press"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '20px 0 10px', textTransform: 'uppercase' }}>
            Lifestyle & Health Parameters
          </h3>

          <div class="form-row">
            <div class="form-group col-6">
              <label>Avg Sleep (Hours / Night)</label>
              <input
                type="number"
                step="0.5"
                class="form-input"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
              />
            </div>
            <div class="form-group col-6">
              <label>Stress Level (1 - 5)</label>
              <select class="form-select" value={stressLevel} onChange={(e) => setStressLevel(e.target.value)}>
                <option value="1">1 - Very Low</option>
                <option value="2">2 - Low</option>
                <option value="3">3 - Moderate</option>
                <option value="4">4 - High</option>
                <option value="5">5 - Extreme</option>
              </select>
            </div>
          </div>

          <button type="submit" class="btn btn-success" style={{ width: '100%', marginTop: '10px' }}>
            <Save size={16} /> Save Profile Settings
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div class="panel">
        <div class="panel-header">
          <h2>Security & Password</h2>
        </div>

        {passwordMsg && (
          <div class="feedback-badge badge-green" style={{ marginBottom: '15px' }}>
            {passwordMsg}
          </div>
        )}
        {passwordError && (
          <div class="feedback-badge badge-red" style={{ marginBottom: '15px' }}>
            {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div class="form-group">
            <label>Current Password</label>
            <input
              type="password"
              class="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div class="form-group">
            <label>New Password (min 8 chars)</label>
            <input
              type="password"
              class="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minlength="8"
            />
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              class="form-input"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              minlength="8"
            />
          </div>
          <button type="submit" class="btn btn-warning" style={{ width: '100%', marginTop: '10px' }}>
            <Lock size={16} /> Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
