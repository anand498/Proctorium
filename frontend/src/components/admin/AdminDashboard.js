import React, { useEffect, useState } from 'react';
import { fetchExamData } from '../../services/api';
import ExamTable from './ExamTable';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [examId, setExamId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await fetchExamData(examId);
                setExamData(data);
            } catch (error) {
                console.error('Error fetching exam data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (examId) {
            fetchData();
        }
    }, [examId]);

    const handleExamIdChange = (e) => {
        setExamId(e.target.value);
    };

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <input
                type="text"
                placeholder="Enter Exam ID"
                value={examId}
                onChange={handleExamIdChange}
            />
            {loading ? (
                <Loader />
            ) : (
                examData && <ExamTable examData={examData} />
            )}
        </div>
    );
};

export default AdminDashboard;