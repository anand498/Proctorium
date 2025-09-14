import React, { useEffect, useState } from 'react';
import { fetchExamData } from '../../services/api';
import './ExamTable.css';

const ExamTable = ({ examId }) => {
    const [examData, setExamData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getExamData = async () => {
            try {
                const data = await fetchExamData(examId);
                setExamData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getExamData();
    }, [examId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="exam-table">
            <h2>Detected Flags for Exam ID: {examId}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Flag Name</th>
                        <th>Screenshot</th>
                    </tr>
                </thead>
                <tbody>
                    {examData.map((flag, index) => (
                        <tr key={index}>
                            <td>{flag.name}</td>
                            <td>
                                <img src={flag.screenshotUrl} alt={flag.name} className="screenshot" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExamTable;