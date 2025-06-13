import React from 'react';
import { useQuery } from '@apollo/client';
import { EVENTS } from '../queries';

const EventPage = () => {
    const EventList = () => {
        const { loading, error, data } = useQuery(EVENTS);
        
        if (loading) return <p>جار التحميل...</p>;
        if (error) return <p>حدث خطأ: {error.message}</p>;
        
        return (
            data.events.map(({ _id, title, description }) => (
                <div key={_id} className="event-item">
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
            ))
        );
    };

    return (
        <div className="event-page">
            <h1>صفحة الحدث</h1>
            <EventList />
        </div>
    );
};

export default EventPage;