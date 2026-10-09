import React, { useState, useEffect } from 'react';
import {
  getMyVolunteerProfileApi,
  registerVolunteerApi,
  updateMyVolunteerProfileApi,
  updateVolunteerAvailabilityApi,
  withdrawVolunteerProfileApi,
  getAvailableOpportunitiesApi,
  expressWillingnessApi,
  markVolunteerTaskCompleteApi,
  getMyVolunteerTaskHistoryApi,
} from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  HeartHandshake,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Power,
  Edit3,
  Trash2,
  Sparkles,
  MapPin,
  Send,
  Award,
} from 'lucide-react';

const PREDEFINED_SKILLS = [
  'First Aid',
  'Translation',
  'Community Support',
  'Accessibility Assistance',
  'Food/Water Distribution Support',
  'Shelter Assistance',
  'Communication Support',
  'Search/Information Assistance',
];

const CitizenVolunteerCenterPage = () => {
  const [profile, setProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [taskHistory, setTaskHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [selectedSkills, setSelectedSkills] = useState(['Community Support']);
  const [bioNotes, setBioNotes] = useState('');
  const [latitude, setLatitude] = useState('17.3850');
  const [longitude, setLongitude] = useState('78.4867');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      try {
        const pData = await getMyVolunteerProfileApi();
        setProfile(pData);
        if (pData) {
          if (pData.skills) {
            setSelectedSkills(pData.skills.split(',').map((s) => s.trim()));
          }
          setBioNotes(pData.bioNotes || '');
          if (pData.latitude) setLatitude(String(pData.latitude));
          if (pData.longitude) setLongitude(String(pData.longitude));
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setProfile(null);
        } else {
          throw err;
        }
      }

      const opps = await getAvailableOpportunitiesApi();
      setOpportunities(opps || []);

      const history = await getMyVolunteerTaskHistoryApi();
      setTaskHistory(history || []);
    } catch (err) {
      console.error('Failed to load volunteer data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load volunteer details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSkillToggle = (skill) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length === 1) return;
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setActionSuccess('');
    try {
      const payload = {
        skills: selectedSkills.join(', '),
        bioNotes: bioNotes.trim(),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      };
      const created = await registerVolunteerApi(payload);
      setProfile(created);
      setActionSuccess('Volunteer application submitted successfully! Pending admin review.');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setActionSuccess('');
    try {
      const payload = {
        skills: selectedSkills.join(', '),
        bioNotes: bioNotes.trim(),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      };
      const updated = await updateMyVolunteerProfileApi(payload);
      setProfile(updated);
      setIsEditing(false);
      setActionSuccess('Volunteer profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;
    const newStatus = profile.availability === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    try {
      const updated = await updateVolunteerAvailabilityApi(newStatus);
      setProfile(updated);
      setActionSuccess(`Availability status updated to ${newStatus}.`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update availability');
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw your volunteer registration?')) return;
    try {
      await withdrawVolunteerProfileApi();
      setProfile(null);
      setActionSuccess('Volunteer registration withdrawn.');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to withdraw');
    }
  };

  const handleExpressWillingness = async (taskId) => {
    setSubmitting(true);
    setError('');
    setActionSuccess('');
    try {
      await expressWillingnessApi(taskId);
      setActionSuccess('Willingness registered! Request submitted for admin review.');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to request task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async (taskId) => {
    setSubmitting(true);
    setError('');
    setActionSuccess('');
    try {
      await markVolunteerTaskCompleteApi(taskId);
      setActionSuccess('Participation marked complete! Thank you for your support.');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to mark complete');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading Citizen Volunteer Center..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
              <HeartHandshake className="w-5 h-5" />
              <span>SafeCity Community Volunteer Program</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Citizen Volunteer Center</h1>
            <p className="text-emerald-200/80 text-sm mt-1 max-w-2xl">
              Verified community volunteers assist with shelter support, logistics, translation, and non-hazardous crisis assistance under professional human supervision.
            </p>
          </div>
          {profile && (
            <div className="flex items-center gap-3 bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/50">
              <div className="text-right">
                <span className="text-xs text-emerald-300 block font-medium">Availability</span>
                <span className={`text-sm font-bold ${profile.availability === 'AVAILABLE' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {profile.availability}
                </span>
              </div>
              <Button
                variant={profile.availability === 'AVAILABLE' ? 'success' : 'secondary'}
                size="sm"
                onClick={handleToggleAvailability}
                icon={Power}
              >
                Toggle
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-950/30 border border-amber-500/40 text-amber-200 p-4 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong className="text-amber-300 font-semibold">Important Emergency Safety Rule:</strong> SafeCity community volunteers are assigned strictly to non-hazardous support operations (e.g. food distribution, shelter aid, translation). Active emergency incident response, active fires, crime scenes, and hazardous materials remain strictly handled by professional first-responders.
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-900/40 border border-emerald-500/50 text-emerald-200 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && <ErrorState message={error} />}

      {/* Main Content Split */}
      {!profile ? (
        /* Volunteer Registration Form */
        <Card title="Register as a Community Volunteer" icon={HeartHandshake}>
          <form onSubmit={handleRegister} className="space-y-6">
            <p className="text-sm text-slate-300">
              Join SafeCity's verified volunteer network. Provide your non-hazardous skills and availability to support shelter operations and community relief efforts during emergencies.
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Select Your Support Skills</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {PREDEFINED_SKILLS.map((skill) => {
                  const isChecked = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/50'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{skill}</span>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Volunteer Bio & Experience Notes</label>
              <textarea
                rows={3}
                value={bioNotes}
                onChange={(e) => setBioNotes(e.target.value)}
                placeholder="Briefly describe any relevant skills or community support experience (e.g. Certified CPR, bilingual in Spanish, shelter management)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Base Latitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Base Longitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="emerald" disabled={submitting} icon={HeartHandshake}>
                {submitting ? 'Submitting Application...' : 'Submit Volunteer Application'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        /* Profile Active Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Volunteer Profile" icon={UserCheck}>
              <div className="space-y-4 text-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Approval Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      profile.approvalStatus === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/50'
                        : profile.approvalStatus === 'PENDING'
                        ? 'bg-amber-950 text-amber-400 border border-amber-600/50'
                        : 'bg-rose-950 text-rose-400 border border-rose-600/50'
                    }`}
                  >
                    {profile.approvalStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Availability</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      profile.availability === 'AVAILABLE'
                        ? 'bg-emerald-900/60 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {profile.availability}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider block mb-2">Registered Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills ? (
                      profile.skills.split(',').map((skill, idx) => (
                        <span key={idx} className="bg-slate-800 text-emerald-300 px-2.5 py-1 rounded-lg text-xs border border-slate-700">
                          {skill.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">None registered</span>
                    )}
                  </div>
                </div>

                {profile.bioNotes && (
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider block mb-1">Notes</span>
                    <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">{profile.bioNotes}</p>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setIsEditing(!isEditing)} icon={Edit3}>
                    {isEditing ? 'Cancel Edit' : 'Edit Skills & Bio'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleWithdraw} icon={Trash2}>
                    Withdraw Registration
                  </Button>
                </div>
              </div>
            </Card>

            {/* Edit Form Modal/Panel */}
            {isEditing && (
              <Card title="Edit Volunteer Profile" icon={Edit3}>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_SKILLS.map((skill) => {
                        const isChecked = selectedSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleSkillToggle(skill)}
                            className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                              isChecked
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Bio / Notes</label>
                    <textarea
                      rows={2}
                      value={bioNotes}
                      onChange={(e) => setBioNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs"
                    />
                  </div>

                  <Button type="submit" variant="emerald" size="sm" disabled={submitting}>
                    Save Changes
                  </Button>
                </form>
              </Card>
            )}
          </div>

          {/* Right Column: Opportunities & Task History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Suitable Opportunities */}
            <Card title="Community Assistance Opportunities" icon={Sparkles}>
              {profile.approvalStatus !== 'APPROVED' ? (
                <div className="p-6 bg-slate-900/60 border border-slate-800 text-center rounded-xl">
                  <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <h4 className="text-slate-200 font-semibold text-base mb-1">Pending Approval</h4>
                  <p className="text-slate-400 text-xs max-w-md mx-auto">
                    Your volunteer application is currently under admin review. Once approved, available shelter support and community opportunities will appear here.
                  </p>
                </div>
              ) : opportunities.length === 0 ? (
                <div className="p-6 bg-slate-900/60 border border-slate-800 text-center rounded-xl text-slate-400 text-sm">
                  No community assistance opportunities currently requested by administrators. Check back shortly.
                </div>
              ) : (
                <div className="space-y-4">
                  {opportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-emerald-800/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold text-base">{opp.title}</span>
                          <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full border border-slate-700 font-medium">
                            {opp.skillRequired}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs">{opp.description}</p>
                        {opp.locationName && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{opp.locationName}</span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {opp.status === 'REQUESTED' ? (
                          <span className="px-3 py-1.5 bg-amber-950 text-amber-400 border border-amber-700/50 rounded-lg text-xs font-semibold">
                            Request Pending Admin Review
                          </span>
                        ) : opp.status === 'APPROVED' ? (
                          <span className="px-3 py-1.5 bg-emerald-950 text-emerald-400 border border-emerald-700/50 rounded-lg text-xs font-semibold">
                            Approved & Assigned
                          </span>
                        ) : (
                          <Button
                            variant="emerald"
                            size="sm"
                            onClick={() => handleExpressWillingness(opp.id)}
                            disabled={submitting || profile.availability !== 'AVAILABLE'}
                            icon={Send}
                          >
                            Express Willingness to Assist
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Participation History & Active Tasks */}
            <Card title="Volunteer Activity & Participation History" icon={Award}>
              {taskHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No activity history recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {taskHistory.map((task) => (
                    <div key={task.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200 block text-sm">{task.title}</span>
                        <span className="text-slate-400 block">{task.description}</span>
                        <span className="text-slate-500 text-[11px] block mt-0.5">
                          Location: {task.locationName || 'Community Hub'} | Required: {task.skillRequired}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : task.status === 'APPROVED'
                              ? 'bg-teal-950 text-teal-300 border border-teal-800'
                              : task.status === 'DECLINED'
                              ? 'bg-rose-950 text-rose-400'
                              : 'bg-amber-950 text-amber-400'
                          }`}
                        >
                          {task.status}
                        </span>

                        {task.status === 'APPROVED' && (
                          <Button variant="success" size="xs" onClick={() => handleMarkComplete(task.id)} disabled={submitting}>
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenVolunteerCenterPage;
