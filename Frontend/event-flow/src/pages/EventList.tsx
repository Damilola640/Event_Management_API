import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import type { Eventitem } from "../types";

const EventList: React.FC = () => {
    const [events, setEvents] = useState<Eventitem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchEvents = async () => {
            try {
                const response = await api.get("/events");
                if (!cancelled) {
                    setEvents(response.data);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.response?.data?.message || "Failed to fetch events");
                } 
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchEvents();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Event List</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <ul className="space-y-4">
                {events.map((event) => (
                    <li key={event.id} className="border p-4 rounded shadow">
                        <h2 className="text-xl font-semibold">{event.title}</h2>
                        <p className="text-gray-600">{event.date}</p>
                        <Link to={`/events/${event.id}`} className="text-blue-500 hover:underline">
                            View Details
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EventList;