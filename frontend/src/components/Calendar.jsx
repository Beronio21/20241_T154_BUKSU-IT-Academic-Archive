import React, { useEffect, useState } from 'react';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadGapi = () => {
            if (window.gapi) {
                window.gapi.load('client:auth2', initClient);
            } else {
                setError("Google API client library not loaded");
            }
        };

        const initClient = () => {
            window.gapi.client.init({
                apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
                clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
                scope: "https://www.googleapis.com/auth/calendar.readonly"
            }).then(() => {
                if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
                    listUpcomingEvents();
                } else {
                    window.gapi.auth2.getAuthInstance().signIn().then(listUpcomingEvents);
                }
            }).catch(error => {
                console.error("Error initializing Google API client", error);
                setError("Failed to initialize Google API client");
            });
        };

        const listUpcomingEvents = () => {
            window.gapi.client.calendar.events.list({
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime'
            }).then(response => {
                const events = response.result.items;
                setEvents(events);
            }).catch(error => {
                console.error("Error fetching events", error);
                setError("Failed to fetch events");
            });
        };

        loadGapi();
    }, []);

    return (
        <div className="calendar-container">
            <h2>Calendar</h2>
            {error ? (
                <p className="error-message">{error}</p>
            ) : (
                <ul>
                    {events.map(event => (
                        <li key={event.id}>
                            {event.summary} - {new Date(event.start.dateTime || event.start.date).toLocaleString()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Calendar;