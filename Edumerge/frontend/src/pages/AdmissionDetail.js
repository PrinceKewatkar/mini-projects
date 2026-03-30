import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AdmissionDetail.css';

const AdmissionDetail = () => {
  const { id } = useParams();
  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const { canEdit } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmission();
  }, [id]);

  const fetchAdmission = async () => {
    try {
      const response = await api.get(`/admissions/${id}/`);
      setAdmission(response.data);
    } catch (error) {
      console.error('Error fetching admission:', error);
      navigate('/admissions');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!window.confirm('Are you sure you want to confirm this admission? This will generate an admission number.')) return;
    try {
      const response = await api.post(`/admissions/${id}/confirm/`);
      setAdmission(response.data);
      alert(`Admission confirmed! Admission Number: ${response.data.admission_number}`);
    } catch (error) {
      console.error('Error confirming admission:', error);
      alert(error.response?.data?.error || 'Error confirming admission');
    }
  };

  const handleUpdateFee = async (feeStatus) => {
    try {
      const response = await api.patch(`/admissions/${id}/update_fee/`, { fee_status: feeStatus });
      setAdmission(response.data);
    } catch (error) {
      console.error('Error updating fee:', error);
      alert('Error updating fee status');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!admission) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <p>Admission not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <button className="btn btn-secondary" onClick={() => navigate('/admissions')} style={{ marginBottom: '20px' }}>
          ← Back to Admissions
        </button>

        <h1 className="page-title">Admission Details</h1>

        <div className="detail-card">
          <div className="detail-section">
            <h3>Admission Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Admission Number</label>
                <span>{admission.admission_number || 'Not Generated'}</span>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <span className={`badge badge-${admission.admission_status.toLowerCase()}`}>
                  {admission.admission_status}
                </span>
              </div>
              <div className="detail-item">
                <label>Fee Status</label>
                <span className={`badge badge-${admission.fee_status.toLowerCase()}`}>
                  {admission.fee_status}
                </span>
              </div>
              <div className="detail-item">
                <label>Allotment Number</label>
                <span>{admission.allotment_number || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Applicant Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Name</label>
                <span>{admission.applicant_name}</span>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <span>{admission.applicant_email}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Program Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Institution</label>
                <span>{admission.institution_name}</span>
              </div>
              <div className="detail-item">
                <label>Program</label>
                <span>{admission.program_name}</span>
              </div>
              <div className="detail-item">
                <label>Quota</label>
                <span>{admission.quota_name}</span>
              </div>
              <div className="detail-item">
                <label>Academic Year</label>
                <span>{admission.academic_year_name}</span>
              </div>
            </div>
          </div>

          {canEdit() && admission.admission_status === 'Pending' && (
            <div className="detail-actions">
              {admission.fee_status === 'Pending' && (
                <button className="btn btn-primary" onClick={() => handleUpdateFee('Paid')}>
                  Mark Fee Paid
                </button>
              )}
              {admission.fee_status === 'Paid' && (
                <button className="btn btn-success" onClick={handleConfirm}>
                  Confirm Admission
                </button>
              )}
            </div>
          )}

          {admission.admission_status === 'Confirmed' && (
            <div className="success-message">
              Admission confirmed! Admission Number: <strong>{admission.admission_number}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdmissionDetail;