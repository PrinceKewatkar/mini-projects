import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Admissions.css';

const Admissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [availableSeats, setAvailableSeats] = useState(null);
  const { canEdit } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedApplicant = searchParams.get('applicant');

  const [formData, setFormData] = useState({
    applicant: preselectedApplicant || '',
    institution: '',
    program: '',
    quota: '',
    academic_year: '',
    allotment_number: ''
  });

  const [filters, setFilters] = useState({
    admission_status: '',
    fee_status: '',
    program: ''
  });

  useEffect(() => {
    fetchAdmissions();
    fetchDropdownData();
  }, [filters]);

  useEffect(() => {
    if (preselectedApplicant) {
      setFormData(prev => ({ ...prev, applicant: preselectedApplicant }));
      setModalOpen(true);
    }
  }, [preselectedApplicant]);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      let url = '/admissions/?';
      if (filters.admission_status) url += `admission_status=${filters.admission_status}&`;
      if (filters.fee_status) url += `fee_status=${filters.fee_status}&`;
      if (filters.program) url += `program=${filters.program}&`;
      const response = await api.get(url);
      setAdmissions(response.data);
    } catch (error) {
      console.error('Error fetching admissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [institutionsRes, programsRes, quotasRes, yearsRes, applicantsRes] = await Promise.all([
        api.get('/institutions/'),
        api.get('/programs/'),
        api.get('/quotas/'),
        api.get('/academic-years/'),
        api.get('/applicants/')
      ]);
      setInstitutions(institutionsRes.data);
      setPrograms(programsRes.data);
      setQuotas(quotasRes.data);
      setAcademicYears(yearsRes.data);
      setApplicants(applicantsRes.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const checkAvailability = async () => {
    if (formData.program && formData.quota && formData.academic_year) {
      try {
        const response = await api.get(`/admissions/available_seats/?program=${formData.program}&quota=${formData.quota}&academic_year=${formData.academic_year}`);
        setAvailableSeats(response.data);
      } catch (error) {
        console.error('Error checking availability:', error);
        setAvailableSeats(null);
      }
    }
  };

  useEffect(() => {
    checkAvailability();
  }, [formData.program, formData.quota, formData.academic_year]);

  useEffect(() => {
    setFilteredPrograms(programs);
  }, [programs]);

  const handleInstitutionChange = (institutionId) => {
    setFormData({ ...formData, institution: institutionId, program: '' });
    setAvailableSeats(null);
    if (institutionId) {
      const filtered = programs.filter(p => p.institution === parseInt(institutionId));
      setFilteredPrograms(filtered);
    } else {
      setFilteredPrograms(programs);
    }
  };

  const openModal = () => {
    setFormData({
      applicant: preselectedApplicant || '',
      institution: '',
      program: '',
      quota: '',
      academic_year: '',
      allotment_number: ''
    });
    setAvailableSeats(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setAvailableSeats(null);
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/admissions/allocate/', formData);
      closeModal();
      fetchAdmissions();
      alert('Seat allocated successfully!');
    } catch (error) {
      console.error('Error allocating seat:', error);
      alert(error.response?.data?.error || 'Error allocating seat');
    }
  };

  const handleConfirm = async (id) => {
    if (!window.confirm('Are you sure you want to confirm this admission? This will generate an admission number.')) return;
    try {
      const response = await api.post(`/admissions/${id}/confirm/`);
      fetchAdmissions();
      alert(`Admission confirmed! Admission Number: ${response.data.admission_number}`);
    } catch (error) {
      console.error('Error confirming admission:', error);
      alert(error.response?.data?.error || 'Error confirming admission');
    }
  };

  const handleUpdateFee = async (id, feeStatus) => {
    try {
      await api.patch(`/admissions/${id}/update_fee/`, { fee_status: feeStatus });
      fetchAdmissions();
    } catch (error) {
      console.error('Error updating fee:', error);
      alert('Error updating fee status');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'applicant_name', label: 'Applicant' },
    { key: 'program_name', label: 'Program' },
    { key: 'quota_name', label: 'Quota' },
    { key: 'academic_year_name', label: 'Academic Year' },
    {
      key: 'admission_status', label: 'Status',
      render: (val) => (
        <span className={`badge badge-${val.toLowerCase()}`}>{val}</span>
      )
    },
    {
      key: 'fee_status', label: 'Fee Status',
      render: (val) => (
        <span className={`badge badge-${val.toLowerCase()}`}>{val}</span>
      )
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/admissions/${row.id}`)}>
            View
          </button>
          {canEdit() && row.admission_status === 'Pending' && (
            <>
              {row.fee_status === 'Pending' && (
                <button className="btn btn-sm btn-primary" onClick={() => handleUpdateFee(row.id, 'Paid')}>
                  Mark Paid
                </button>
              )}
              {row.fee_status === 'Paid' && row.applicant_document_status === 'Verified' && (
                <button className="btn btn-sm btn-success" onClick={() => handleConfirm(row.id)}>
                  Confirm
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <h1 className="page-title">Admissions</h1>

        <div className="card">
          <div className="card-header">
            <div className="filter-group">
              <select
                className="form-select"
                value={filters.admission_status}
                onChange={(e) => setFilters({ ...filters, admission_status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                className="form-select"
                value={filters.fee_status}
                onChange={(e) => setFilters({ ...filters, fee_status: e.target.value })}
              >
                <option value="">All Fee Status</option>
                <option value="Pending">Fee Pending</option>
                <option value="Paid">Fee Paid</option>
              </select>
              <select
                className="form-select"
                value={filters.program}
                onChange={(e) => setFilters({ ...filters, program: e.target.value })}
              >
                <option value="">All Programs</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {canEdit() && (
              <button className="btn btn-primary" onClick={openModal}>
                + New Admission
              </button>
            )}
          </div>

          <DataTable
            columns={columns}
            data={admissions}
            loading={loading}
            emptyMessage="No admissions found"
          />
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="Allocate Seat"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAllocate} disabled={!availableSeats || availableSeats.available <= 0}>
              Allocate Seat
            </button>
          </>
        }
      >
        <form onSubmit={handleAllocate}>
          <div className="form-group">
            <label className="form-label">Institution</label>
            <select
              className="form-select"
              value={formData.institution}
              onChange={(e) => handleInstitutionChange(e.target.value)}
              required
            >
              <option value="">Select Institution</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Applicant</label>
            <select
              className="form-select"
              value={formData.applicant}
              onChange={(e) => setFormData({ ...formData, applicant: e.target.value })}
              required
            >
              <option value="">Select Applicant</option>
              {applicants.filter(a => a.document_status === 'Verified').map((a) => (
                <option key={a.id} value={a.id}>{a.full_name} ({a.email})</option>
              ))}
            </select>
            <small style={{ color: '#5f6368' }}>Only applicants with verified documents are shown</small>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Program</label>
              <select
                className="form-select"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                required
              >
                <option value="">Select Program</option>
                {filteredPrograms.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quota</label>
              <select
                className="form-select"
                value={formData.quota}
                onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                required
              >
                <option value="">Select Quota</option>
                {quotas.map((q) => (
                  <option key={q.id} value={q.id}>{q.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select
                className="form-select"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                required
              >
                <option value="">Select Academic Year</option>
                {academicYears.filter(y => y.is_active).map((y) => (
                  <option key={y.id} value={y.id}>{y.year}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Allotment Number (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={formData.allotment_number}
                onChange={(e) => setFormData({ ...formData, allotment_number: e.target.value })}
                placeholder="Government allotment number"
              />
            </div>
          </div>

          {availableSeats && (
            <div className="availability-info">
              <h4>Seat Availability</h4>
              <p>Total Seats: {availableSeats.total}</p>
              <p>Allocated: {availableSeats.allocated}</p>
              <p className={availableSeats.available > 0 ? 'available' : 'unavailable'}>
                Available: {availableSeats.available}
              </p>
              {availableSeats.available <= 0 && (
                <p className="error-message">No seats available in this quota!</p>
              )}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Admissions;