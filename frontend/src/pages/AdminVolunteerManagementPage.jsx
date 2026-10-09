import React, { useState, useEffect } from 'react';
import {
  getAllVolunteersAdminApi,
  updateVolunteerApprovalAdminApi,
  createVolunteerOpportunityAdminApi,
  getAllVolunteerTasksAdminApi,
  reviewVolunteerTaskAdminApi,
  getAllSheltersAdminApi,
} from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  MapPin,
  Send,
  Ban,
  ShieldCheck,
  Search,
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

const AdminVolunteerManagementPage = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for creating opportunity
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [oppForm, setOppForm] = useState({
    title: '',
    description: '',
    skillRequired: 'Food/Water Distribution Support',
    shelterId: '',
    locationName: 'Central Shelter Hub',
  });
  const [submitting, setSubmitting] = useState(false);

  // Reject Modal State
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const volData = await getAllVolunteersAdminApi(statusFilter || undefined, availFilter || undefined);
      setVolunteers(volData || []);

      const taskData = await getAllVolunteerTasksAdminApi();
      setTasks(taskData || []);

      try {
        const shelterData = await getAllSheltersAdminApi();
        setShelters(shelterData || []);
      } catch (err) {
        console.warn('Shelters fetch warning:', err);
      }
    } catch (err) {
      console.error('Failed to load admin volunteer data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load volunteer management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, availFilter]);

  const handleApprovalUpdate = async (profileId, newStatus, reason = '') => {
    setSubmitting(true);
    setError('');
    setActionSuccess('');
    try {
      await updateVolunteerApprovalAdminApi(profileId, newStatus, reason);
      setActionSuccess(`Volunteer status updated to ${newStatus}. Notification sent.`);
      setRejectingId(null);
      setRejectReason('');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Approval update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    if (!oppForm.title.trim()) {
      setError('Opportunity title is required');
      return;
    }
    setSubmitting(true);
    setError('');
    setActionSuccess('');
    try {
      const payload = {
        title: oppForm.title.trim(),
        description: oppForm.description.trim(),
        skillRequired: oppForm.skillRequired,
        shelterId: oppForm.shelterId ? parseInt(oppForm.shelterId) : null,
        locationName: oppForm.locationName.trim(),
      };
      await createVolunteerOpportunityAdminApi(payload);
      setActionSuccess('Community assistance opportunity posted! Notified approved & available volunteers.');
      setShowCreateForm(false);
      setOppForm({
        title: '',
        description: '',
        skillRequired: 'Food/Water Distribution Support',
        shelterId: '',
        locationName: 'Central Shelter Hub',
      });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to post opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskReview = async (taskId, newStatus, notes = '') => {
    setSubmitting(true);
    setError('');
    setActionSuccess('');
    try {
      await reviewVolunteerTaskAdminApi(taskId, newStatus, notes);
      setActionSuccess(`Assistance request reviewed and set to ${newStatus}. Volunteer notified.`);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Task review failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVolunteers = volunteers.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (v.fullName && v.fullName.toLowerCase().includes(q)) ||
      (v.email && v.email.toLowerCase().includes(q)) ||
      (v.skills && v.skills.toLowerCase().includes(q))
    );
  });

  const pendingApplications = volunteers.filter((v) => v.approvalStatus === 'PENDING');
  const pendingRequests = tasks.filter((t) => t.status === 'REQUESTED');

  if (loading) return <LoadingState message="Loading Volunteer Management Panel..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-2xl shadow-xl border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span>SafeCity Operational Command</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Volunteer Management</h1>
            <p className="text-emerald-200/80 text-sm mt-1 max-w-2xl">
              Review volunteer applications, oversee non-hazardous community assistance requests, post shelter support tasks, and ensure safety separation from professional emergency response.
            </p>
          </div>
          <Button variant="emerald" onClick={() => setShowCreateForm(!showCreateForm)} icon={Plus}>
            {showCreateForm ? 'Cancel Opportunity' : 'Create Community Opportunity'}
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-900/40 border border-emerald-500/50 text-emerald-200 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && <ErrorState message={error} />}

      {/* Create Opportunity Form Card */}
      {showCreateForm && (
        <Card title="Post Community Assistance Opportunity" icon={Sparkles}>
          <form onSubmit={handleCreateOpportunity} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1">Opportunity Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Shelter Food Distribution Aid"
                value={oppForm.title}
                onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1">Description & Logistics</label>
              <textarea
                rows={2}
                placeholder="Details of support needed (e.g. Assisting shelter staff with water box distribution and seating)..."
                value={oppForm.description}
                onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">Required Support Skill</label>
                <select
                  value={oppForm.skillRequired}
                  onChange={(e) => setOppForm({ ...oppForm, skillRequired: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 text-sm"
                >
                  {PREDEFINED_SKILLS.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">Link Shelter (Optional)</label>
                <select
                  value={oppForm.shelterId}
                  onChange={(e) => setOppForm({ ...oppForm, shelterId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 text-sm"
                >
                  <option value="">-- None (Standalone Hub) --</option>
                  {shelters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.shelterCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">Location Name</label>
                <input
                  type="text"
                  value={oppForm.locationName}
                  onChange={(e) => setOppForm({ ...oppForm, locationName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="emerald" disabled={submitting} icon={Send}>
                {submitting ? 'Posting...' : 'Post Opportunity & Notify Volunteers'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Pending Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Application Reviews */}
        <Card title={`Pending Applications (${pendingApplications.length})`} icon={Clock}>
          {pendingApplications.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No pending volunteer registrations.</p>
          ) : (
            <div className="space-y-3">
              {pendingApplications.map((v) => (
                <div key={v.id} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block text-sm">{v.fullName || 'Citizen User'}</span>
                    <span className="text-emerald-400 block">{v.email}</span>
                    <span className="text-slate-300 block mt-1">Skills: {v.skills || 'None'}</span>
                    {v.bioNotes && <span className="text-slate-400 block italic text-[11px]">"{v.bioNotes}"</span>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="success" size="xs" onClick={() => handleApprovalUpdate(v.id, 'APPROVED')} icon={CheckCircle2}>
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="xs"
                      onClick={() => {
                        setRejectingId(v.id);
                        setRejectReason('');
                      }}
                      icon={XCircle}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Task Assistance Requests */}
        <Card title={`Pending Task Requests (${pendingRequests.length})`} icon={Sparkles}>
          {pendingRequests.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No pending volunteer assistance requests.</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block text-sm">{req.title}</span>
                    <span className="text-emerald-400 block">Volunteer: {req.volunteerName || 'Approved Volunteer'}</span>
                    <span className="text-slate-300 block">Required Skill: {req.skillRequired}</span>
                    {req.locationName && <span className="text-slate-400 text-[11px] block">Location: {req.locationName}</span>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="success" size="xs" onClick={() => handleTaskReview(req.id, 'APPROVED')} icon={CheckCircle2}>
                      Approve Participation
                    </Button>
                    <Button variant="danger" size="xs" onClick={() => handleTaskReview(req.id, 'DECLINED', 'Over-staffed')} icon={XCircle}>
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Reject Reason Dialog */}
      {rejectingId && (
        <div className="p-4 bg-rose-950/40 border border-rose-600/50 rounded-xl space-y-3">
          <h4 className="text-rose-200 font-semibold text-sm">Provide Rejection Reason</h4>
          <input
            type="text"
            placeholder="Reason for rejection (e.g. Unverified credentials or unsupported skill)..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="xs"
              onClick={() => handleApprovalUpdate(rejectingId, 'REJECTED', rejectReason)}
              disabled={submitting}
            >
              Confirm Rejection
            </Button>
            <Button variant="secondary" size="xs" onClick={() => setRejectingId(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Volunteer Directory & Status Management Table */}
      <Card title="Volunteer Directory & Management" icon={Users}>
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, email, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-200 text-xs"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 text-xs"
            >
              <option value="">All Approval Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>

          <div>
            <select
              value={availFilter}
              onChange={(e) => setAvailFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 text-xs"
            >
              <option value="">All Availability</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="UNAVAILABLE">UNAVAILABLE</option>
            </select>
          </div>
        </div>

        {filteredVolunteers.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No volunteer profiles matching criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Volunteer</th>
                  <th className="p-3">Skills</th>
                  <th className="p-3">Approval</th>
                  <th className="p-3">Availability</th>
                  <th className="p-3">Proximity</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredVolunteers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-200">
                      <div>{v.fullName || 'Citizen User'}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{v.email}</div>
                    </td>
                    <td className="p-3 max-w-xs truncate">{v.skills || 'N/A'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.approvalStatus === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                            : v.approvalStatus === 'PENDING'
                            ? 'bg-amber-950 text-amber-400 border border-amber-700'
                            : 'bg-rose-950 text-rose-400 border border-rose-700'
                        }`}
                      >
                        {v.approvalStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-semibold ${v.availability === 'AVAILABLE' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {v.availability}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {v.latitude && v.longitude ? `${v.latitude}, ${v.longitude}` : 'No location'}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {v.approvalStatus !== 'APPROVED' && (
                          <Button variant="success" size="xs" onClick={() => handleApprovalUpdate(v.id, 'APPROVED')}>
                            Approve
                          </Button>
                        )}
                        {v.approvalStatus !== 'SUSPENDED' && (
                          <Button variant="secondary" size="xs" onClick={() => handleApprovalUpdate(v.id, 'SUSPENDED')}>
                            Suspend
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminVolunteerManagementPage;
