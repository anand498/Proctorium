import React from 'react';
import { useParams } from 'react-router-dom';

const FlagDetails = () => {
    const { examId, flagName } = useParams();
    const [flagDetails, setFlagDetails] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const fetchFlagDetails = async () => {
            try {
                const response = await fetch(`/api/admin/flags/${examId}/${flagName}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch flag details');
                }
                const data = await response.json();
                setFlagDetails(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFlagDetails();
    }, [examId, flagName]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Flag Details for Exam ID: {examId}</h2>
            <h3>Flag Name: {flagDetails.flagName}</h3>
            <p>Description: {flagDetails.description}</p>
            <img src={flagDetails.screenshotUrl} alt="Flag Screenshot" />
        </div>
    );
};

export default FlagDetails;