import React { useEffect, useState} from "react";
import { useParams, useNavigate} from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../services/AuthContext";
import { useState } from "react";

const RSVPPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const { navigate } = useNavigate();
    const {name, setName} = useState("");
    const {email, setEmail} = useState("");
    const { token } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [eventTitle, setEventTitle] = useState<string>("");
    const [eventDate, setEventDate] = useState<string>("");
    const [eventLocation, setEventLocation] = useState<string>("");
    const [eventDescription, setEventDescription] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!eventId) return;

        let cancelled = false;

        const fetchEventDetails = async () => {
            try {
                const response = await api.get(`/events/${eventId}`);
                if (!cancelled) {
                    setEventTitle(response.data.title);
                    setEventDate(response.data.date);
                    setEventLocation(response.data.location);
                    setEventDescription(response.data.description);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.response?.data?.message || "Failed to fetch event details");
                } 
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchEventDetails();

        return () => {
            cancelled = true;
        };
    }, [eventId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const response = await api.post(`/events/${eventId}/rsvp`, { name, email }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccess(response.data.message);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to RSVP");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="name"
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            RSVP
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RSVPPage;