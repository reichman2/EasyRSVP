import Navbar from "../components/Navbar";
import { getEvents } from "../api/apiService";
import { useEffect, useState } from "react";
import { Event } from "../utils/types";

const DashboardPage = () => {
    const [events, setEvents] = useState<any>({});

    const fetchEvents = async () => {
        let eventData;
        try {
            eventData = await getEvents({ limit: 6, offset: 0 });
        } catch (err: any) {
            console.error("Error fetching events:", err.message);
            console.error(err);
        }

        if (eventData) {
            setEvents(eventData);
        }

        console.log("Fetched events:", eventData);
        return eventData;
    };

    // Fetch events when the component mounts
    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <div className="">
            <Navbar />

            <div>
                <div className="mx-6 my-6 bg-gray-100 rounded-md px-2 py-2">
                    {/* Event Details */}
                    <h1 className="text-2xl mb-4">My Events</h1>
                    <div className="">
                        { events?.events?.length > 0 ? (
                            // <ul className="grid grid-cols-3 justify-items-stretch gap-x-5 gap-y-3 content-center">
                            eventList(events)
                        ) : (<p>No events found.</p>) }
                    </div>
                </div>
            </div>
        </div>
    );
};

const eventList = (events: any) => {
    const eventListItem = (event: Event) => {
        const totalRsvps = event.rsvps?.length || 0;
        const attendingCount = event.rsvps?.filter((rsvp: any) => rsvp.status === 'ACCEPTED').length || 0;
        const maybeCount = event.rsvps?.filter((rsvp: any) => rsvp.status === 'MAYBE').length || 0;
        const declinedCount = event.rsvps?.filter((rsvp: any) => rsvp.status === 'DECLINED').length || 0;

        return (
            <li className="bg-white shadow-md rounded-lg p-4 grow">
                <div className="flex flex-row justify-between">
                    <h2 className="text-lg">{ event.title }</h2>
                    {/* <span><LuCircleEllipsis /></span> */}
                </div>
                <hr className="bg-gray-300 border-0 h-px mb-3" />
                {/* <p className="text-sm text-gray-500">{ event.description }</p> */}
                <p className="text-xs text-gray-500">{ formatDate(new Date(event.startDate)) }</p>
                <p className="text-xs text-gray-500">{ event.location }</p>

                <div>
                    <ul>
                        <li className="text-sm">RSVPs: { totalRsvps }</li>
                        <li className="text-sm">Attending: { attendingCount }</li>
                        <li className="text-sm">Maybe: { maybeCount }</li>
                        <li className="text-sm">Declined: { declinedCount }</li>
                    </ul>
                </div>
            </li>
        );
    };

    return (
        <ul className="flex flex-row gap-4 flex-wrap justify-center">
            { events.events.map((event: Event, idx: number) => {
                return eventListItem(event);
            }) }
        </ul>
    );
}


const formatDate = (date: Date) => {
    // TODO should this be a utility function? (moved to utils dir)
    const formatter = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    return formatter.format(date);
}

export default DashboardPage;