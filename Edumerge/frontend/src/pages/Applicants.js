import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Applicants.css';

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState('');
  const { canEdit } = useAuth();
  const navigate = useNavigate();

  const initialForm = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male',
    category: 'GM',
    entry_type: 'Regular',
    qualifying_exam: '',
    qualifying_exam_marks: '',
    document_status: 'Pending'
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchApplicants();
  }, [filter]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      let url = '/applicants/';
      if (filter) {
        url += `?document_status=${filter}`;
      }
      const response = await api.get(url);
      setApplicants(response.data);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        first_name: item.first_name,
        last_name: item.last_name,
        email: item.email,
        phone: item.phone,
        date_of_birth: item.date_of_birth,
        gender: item.gender,
        category: item.category,
        entry_type: item.entry_type,
        qualifying_exam: item.qualifying_exam,
        qualifying_exam_marks: item.qualifying_exam_marks,
        document_status: item.document_status
      });
    } else {
      setEditingItem(null);
      setFormData(initialForm);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.patch(`/applicants/${editingItem.id}/`, formData);
      } else {
        await api.post('/applicants/', formData);
      }
      closeModal();
      fetchApplicants();
    } catch (error) {
      console.error('Error saving applicant:', error);
      alert(error.response?.data?.detail || 'Error saving applicant');
    }
  };

  const handleVerifyDocuments = async (id) => {
    try {
      await api.patch(`/applicants/${id}/verify_documents/`);
      fetchApplicants();
    } catch (error) {
      console.error('Error verifying documents:', error);
      alert('Error verifying documents');
    }
  };

  const handleSubmitDocuments = async (id) => {
    try {
      await api.patch(`/applicants/${id}/submit_documents/`);
      fetchApplicants();
    } catch (error) {
      console.error('Error submitting documents:', error);
      alert('Error submitting documents');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this applicant?')) return;
    try {
      await api.delete(`/applicants/${id}/`);
      fetchApplicants();
    } catch (error) {
      console.error('Error deleting applicant:', error);
      alert('Error deleting applicant');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'category_display', label: 'Category' },
    { key: 'entry_type_display', label: 'Entry Type' },
    {
      key: 'document_status', label: 'Documents',
      render: (val) => (
        <span className={`badge badge-${val.toLowerCase()}`}>{val}</span>
      )
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          {canEdit() && (
            <>
              <button className="btn btn-sm btn-secondary" onClick={() => openModal(row)}>Edit</button>
              {row.document_status === 'Pending' && (
                <button className="btn btn-sm btn-primary" onClick={() => handleSubmitDocuments(row.id)}>Submit Docs</button>
              )}
              {row.document_status === 'Submitted' && (
                <button className="btn btn-sm btn-success" onClick={() => handleVerifyDocuments(row.id)}>Verify</button>
              )}
              <button className="btn btn-sm btn-primary" onClick={() => navigate(`/admissions?applicant=${row.id}`)}>Allocate</button>
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
        <h1 className="page-title">Applicants</h1>

        <div className="card">
          <div className="card-header">
            <div className="filter-group">
              <select
                className="form-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
                <option value="Verified">Verified</option>
              </select>
            </div>
            {canEdit() && (
              <button className="btn btn-primary" onClick={() => openModal()}>
                + Add Applicant
              </button>
            )}
          </div>

          <DataTable
            columns={columns}
            data={applicants}
            loading={loading}
            emptyMessage="No applicants found"
          />
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Applicant' : 'Add Applicant'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="GM">General Merit (GM)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="OBC">Other Backward Class (OBC)</option>
                <option value="EWS">Economically Weaker Section (EWS)</option>
                <option value="CAT-1">Category 1</option>
                <option value="2A">2A</option>
                <option value="2B">2B</option>
                <option value="3A">3A</option>
                <option value="3B">3B</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Entry Type</label>
              <select
                className="form-select"
                value={formData.entry_type}
                onChange={(e) => setFormData({ ...formData, entry_type: e.target.value })}
              >
                <option value="Regular">Regular</option>
                <option value="Lateral">Lateral</option>
              </select>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Qualifying Exam</label>
              <input
                type="text"
                className="form-input"
                value={formData.qualifying_exam}
                onChange={(e) => setFormData({ ...formData, qualifying_exam: e.target.value })}
                placeholder="e.g., 12th Board"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Marks (%)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.qualifying_exam_marks}
                onChange={(e) => setFormData({ ...formData, qualifying_exam_marks: e.target.value })}
                required
              />
            </div>
          </div>

          {editingItem && (
            <div className="form-group">
              <label className="form-label">Document Status</label>
              <select
                className="form-select"
                value={formData.document_status}
                onChange={(e) => setFormData({ ...formData, document_status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
                <option value="Verified">Verified</option>
              </select>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Applicants;