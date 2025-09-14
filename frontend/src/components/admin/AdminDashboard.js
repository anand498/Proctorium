import React, { useEffect, useState } from 'react';
import { fetchExamData, fetchAllExams } from '../../services/api';
import ExamDetailsView from './ExamDetailsView';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
    const [examData, setExamData] = useState(null);
    const [allExams, setAllExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAllExams, setLoadingAllExams] = useState(true);
    const [examId, setExamId] = useState('');

    // Fetch all exams on component mount
    useEffect(() => {
        const fetchAllExamsData = async () => {
            setLoadingAllExams(true);
            try {
                const exams = await fetchAllExams();
                setAllExams(exams);
            } catch (error) {
                console.error('Error fetching all exams:', error);
            } finally {
                setLoadingAllExams(false);
            }
        };

        fetchAllExamsData();
    }, []);

    // Fetch specific exam data when examId changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await fetchExamData(examId);
                setExamData(data);
            } catch (error) {
                console.error('Error fetching exam data:', error);
                setExamData(null);
            } finally {
                setLoading(false);
            }
        };

        if (examId) {
            fetchData();
        } else {
            setExamData(null);
            setLoading(false);
        }
    }, [examId]);

    const handleExamIdChange = (e) => {
        setExamId(e.target.value);
    };

    const handleExamSelect = (selectedExamId) => {
        setExamId(selectedExamId);
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
            {/* Only show exam selection if no exam is selected */}
            {!examId && (
                <>
                    <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#212529', marginBottom: '24px' }}>
                        Admin Dashboard
                    </h1>
                    
                    {/* Manual Exam ID Input */}
                    <div style={{ marginBottom: '24px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#495057' }}>Search by Exam ID</h3>
                        <input
                            type="text"
                            placeholder="Enter Exam ID"
                            value={examId}
                            onChange={handleExamIdChange}
                            style={{ 
                                padding: '12px 16px', 
                                width: '100%', 
                                maxWidth: '400px',
                                border: '1px solid #ced4da',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#007bff'}
                            onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                        />
                    </div>

                    {/* Available Exams List */}
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0', color: '#495057' }}>Available Exams</h3>
                        </div>
                        
                        {loadingAllExams ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <Loader />
                                <p style={{ marginTop: '16px', color: '#6c757d' }}>Loading available exams...</p>
                            </div>
                        ) : allExams.length > 0 ? (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {allExams.map((exam) => (
                                    <div 
                                        key={exam.exam_id} 
                                        style={{ 
                                            padding: '16px 20px', 
                                            borderBottom: '1px solid #f1f3f4',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s ease',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        onClick={() => handleExamSelect(exam.exam_id)}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#212529', marginBottom: '4px' }}>
                                                {exam.exam_id}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                                Status: <span style={{ 
                                                    color: exam.status === 'completed' ? '#28a745' : '#ffc107',
                                                    fontWeight: '500'
                                                }}>
                                                    {exam.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#dc3545' }}>
                                                    {exam.flags ? exam.flags.length : 0}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6c757d' }}>Violations</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#007bff' }}>
                                                    {exam.screenshots ? exam.screenshots.length : 0}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6c757d' }}>Screenshots</div>
                                            </div>
                                            <div style={{ 
                                                backgroundColor: '#007bff', 
                                                color: 'white', 
                                                padding: '6px 12px', 
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}>
                                                View Details →
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <p style={{ color: '#6c757d', fontSize: '16px' }}>No exams found in the database.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Exam Details View */}
            {examId && (
                <div>
                    {/* Back Button */}
                    <div style={{ marginBottom: '20px' }}>
                        <button 
                            onClick={() => setExamId('')}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            ← Back to Exam List
                        </button>
                    </div>
                    
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Loader />
                        </div>
                    ) : examData ? (
                        <ExamDetailsView examData={examData} />
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '40px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <p style={{ fontSize: '16px', color: '#dc3545' }}>No data found for exam ID: {examId}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
