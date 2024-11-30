import React, { useEffect, useState } from 'react';

const GmailReader = () => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmails = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/gmail/emails');
                const data = await response.json();
                console.log('Fetched emails:', data);
                setEmails(data);
            } catch (error) {
                console.error('Error fetching emails:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmails();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Emails</h2>
            <ul>
                {emails.map((email, index) => (
                    <li key={index}>
                        <strong>From:</strong> {email.from} <br />
                        <strong>Subject:</strong> {email.subject}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GmailReader;