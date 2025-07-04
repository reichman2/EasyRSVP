import Navbar from "../components/Navbar";
import { getEvents, getRsvps } from "../api/apiService";
import { useEffect, useState } from "react";
import { Event, RSVP } from "../utils/types";
import { LuEllipsis, LuPencil } from "react-icons/lu";
import Badge from "../components/Badge";

const DashboardPage = () => {
    const [events, setEvents] = useState<any>({});
    const [rsvps, setRsvps] = useState<any>({});

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

    const fetchRsvps = async () => {
        let rsvpData;
        try {
            rsvpData = await getRsvps();
        } catch (err: any) {
            console.error("Error fetching RSVPs:", err.message);
            console.error(err);
        }

        if (rsvpData) {
            setRsvps(rsvpData);
        }

        console.log("Fetched RSVPs:", rsvpData);
        return rsvpData;
    };

    // Fetch events when the component mounts
    useEffect(() => {
        fetchEvents();
        fetchRsvps();
    }, []);


    return (
        <div className="">
            <Navbar />

            <div>
                <div className="mx-6 my-6 bg-gray-100 rounded-md px-2 py-2">
                    {/* Event Details */}
                    <h1 className="text-2xl mb-4"><a href="/events">My Events</a></h1>
                    <div className="">
                        { events?.events?.length > 0 ? (
                            eventList(events)
                        ) : (<p>No events found.</p>) }
                    </div>
                </div>

                <div className="m-6 bg-gray-100 rounded-md p-2">
                    {/* RSVP Details */}
                    <h1 className="text-2xl mb-4"><a href="/rsvps">My RSVPs</a></h1>
                    <div className="">
                        { rsvps?.rsvps?.length > 0 ? (
                            rsvpList(rsvps)
                        ) : (<p>No RSVPs found.</p>) }
                    </div>
                </div>
            </div>
        </div>
    );
};

const eventList = (events: any) => {
    const eventListItem = (event: Event, key: number) => {
        const totalRsvps = event.rsvps?.length || 0;
        const attendingCount = event.rsvps?.filter((rsvp: any) => rsvp.status === 'ACCEPTED').length || 0;
        const maybeCount = event.rsvps?.filter((rsvp: any) => rsvp.status === 'MAYBE').length || 0;
        const declinedCount = event.rsvps?.filter((rsvp: any) => rsvp.status === 'DECLINED').length || 0;
        let eventDateText = "";

        if (event.endDate) {
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);

            if (startDate === endDate) {
                eventDateText = `${formatDate(startDate)}`;
            } else if (startDate.getDate() === endDate.getDate() && startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
                // Same day, different time
                eventDateText = `${formatDate(startDate)} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                // Different days
                eventDateText = `${formatDate(startDate)} - ${formatDate(endDate)}`;
            }
        }

        return (
            <li className="bg-white shadow-md rounded-lg p-4 grow" key={ key }>
                <div className="flex flex-row justify-between">
                    <h2 className="text-lg">{ event.title }</h2>
                    <span><LuEllipsis /></span>
                </div>
                <hr className="bg-gray-300 border-0 h-px mb-3" />
                {/* <p className="text-sm text-gray-500">{ event.description }</p> */}
                <p className="text-xs text-gray-500">{ eventDateText }</p>
                <p className="text-xs text-gray-500">{ event.location }</p>

                <div>
                    <ul>
                        <li className="text-sm">RSVPs: { totalRsvps }</li>
                        <li className="text-sm">Attending: { attendingCount }</li>
                        <li className="text-sm">Maybe: { maybeCount }</li>
                        <li className="text-sm">Declined: { declinedCount }</li>
                        {/* <li className="text-sm">End Date: { event.endDate ? formatDate(new Date(event.endDate)) : "N/A" }</li> */}
                    </ul>
                </div>
            </li>
        );
    };

    return (
        <ul className="flex flex-row gap-4 flex-wrap justify-center">
            { events.events.map((event: Event, idx: number) => {
                return eventListItem(event, idx);
            }) }
        </ul>
    );
}

const rsvpList = (rsvps: { rsvps: RSVP[], length: number, message?: string }) => {
    const rsvpListItem = (rsvp: RSVP, key: number) => {
        const status = rsvp.status;
        const eventTitle = rsvp.event?.title || "Unknown Event";
        const eventDate = rsvp.event?.startDate? new Date(rsvp.event.startDate) : "Unknown Date";
        const formattedDate = eventDate instanceof Date ? formatDate(eventDate) : eventDate;

        const STATUS_BADGES = {
            ACCEPTED: <Badge text="Accepted" color="green" />,
            MAYBE: <Badge text="Maybe" color="yellow" />,
            DECLINED: <Badge text="Declined" color="red" />,
            PENDING: <Badge text="Pending" color="gray" />
        }

        return (
            <li className="bg-white shadow-md rounded-lg p-4 grow" key={ key }>
                <div className="flex flex-row justify-between">
                    <h2 className="text-lg">{ eventTitle }</h2>
                    <span className="text-sm"><LuPencil /></span>
                </div>

                <hr className="bg-gray-300 border-0 h-px mb-3" />
                <div>
                    <p className="text-xs text-gray-500">{ formattedDate }</p>
                    <p className="text-xs text-gray-500">{ rsvp.event?.location }</p>
                </div>

                <div className="mt-2">
                    { STATUS_BADGES[status] }
                </div>
            </li>
        )
    };

    return (
        <ul className="flex flex-row gap-4 flex-wrap justify-center">
            { rsvps.rsvps.map((rsvp: RSVP, idx: number) => {
                return rsvpListItem(rsvp, idx);
            }) }
        </ul>
    )
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

const titleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

export default DashboardPage;