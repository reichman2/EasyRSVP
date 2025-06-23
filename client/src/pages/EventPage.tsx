import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getEvents } from "../api/apiService";
import Badge from "../components/Badge";
import { LuChevronLeft, LuChevronRight, LuPencil, LuTrash2 } from "react-icons/lu";
import { Event } from "../utils/types";
import Button from "../components/Button";

const EventPage = () => {
    const [events, setEvents] = useState<any>({});

    // TODO make this a hook
    const fetchEvents = async () => {
        let eventData;
        try {
            eventData = await getEvents({ limit: 10, offset: 0 });
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

    const statusBadges = {
        UPCOMING: <Badge text="Upcoming" color="gray" />,
        ONGOING: <Badge text="Ongoing" color="yellow" />,
        COMPLETED: <Badge text="Completed" color="green" />,
        CANCELLED: <Badge text="Cancelled" color="red" />
    }

    const eventRows = events?.events?.map((event: Event, index: number) => (
        <tr key={ index } className={`border-gray-200 ${events.events.length - 1 === index? "" : "border-b"}`}>
            <td scope="row" className="py-3 px-4 text-sm">{ event.title }</td>
            <td scope="row" className="py-3 px-4 text-xs text-center">
                <div>
                    <span>{ formatDate(new Date(event.startDate)) }</span> <br />
                    <span>{ formatTime(new Date(event.startDate)) }</span>
                </div>
            </td>
            <td scope="row" className="py-3 px-4 text-xs text-center">
                { event.endDate &&
                <div>
                    <span>{ formatDate(new Date(event.endDate)) }</span> <br />
                    <span>{ formatTime(new Date(event.endDate)) }</span>
                </div>
                }
            </td>
            <td scope="row" className="py-3 px-4 text-sm">{ event.location }</td>
            <td scope="row" className="py-3 px-4 text-sm text-center"><span className="bg-gray-200 px-2 py-1 rounded-md text-gray-800">{ event.rsvps?.length || 0 }</span></td>
            <td scope="row" className="py-3 px-4 text-sm text-center">{ statusBadges[event.status] }</td>
            <td scope="row" className="py-3 px-4 text-sm">
                <div className="flex justify-center items-center space-x-4">
                    <button className="cursor-pointer hover:text-yellow-500"><LuPencil /></button>
                    <button className="cursor-pointer hover:text-red-700"><LuTrash2 /></button>
                </div>
            </td>
        </tr>
    ));

    return (
        <div>
            <Navbar />

            <div>
                <div className="mx-6 my-6 bg-gray-100 rounded-md px-2 py-2">
                    <ul className="list-none flex flex-row gap-8 px-4 py-4">
                        <li>
                            <h1 className="text-2xl mb-4">My Events</h1>
                        </li>
                        <li className="ml-auto">
                            <Button className="ml-auto px-3 py-1.5 hover:bg-teal-700">+ Create Event</Button>
                        </li>
                    </ul>
                    {/* <p className="text-gray-600">This page will display your events.</p> */}

                    <div className="bg-white p-5 rounded-md">
                        {/* Table of events. */}
                        <table className="table-auto md:table-fixed min-w-full">
                            <thead className="">
                                <tr className="text-gray-600 border-b border-gray-200">
                                    <th scope="col" className="pb-2 uppercase font-light text-xs">Event Title</th>
                                    <th scope="col" className="pb-2 uppercase font-light text-xs">Start Date</th>
                                    <th scope="col" className="pb-2 uppercase font-light text-xs">End Date</th>
                                    <th scope="col" className="pb-2 uppercase font-light text-xs">Location</th>
                                    <th scope="col" className="pb-2 uppercase font-light text-xs">RSVPs</th>
                                    <th scope="col" className="pb-2 uppercase font-light text-xs">Status</th>
                                    <th scope="col" className="pb-2 uppercase font-light text-xs">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eventRows}
                            </tbody>
                        </table>

                        <div className="">
                            <ul className="list-none flex flex-row gap-4 items-center mt-4">
                                <li className="align-middle">
                                    <p className="text-gray-600 mt-4 text-xs align-middle inline">Showing {events?.events?.length || 0} events.</p>
                                </li>
                                <li className="ml-auto">
                                    <div className="flex gap-2 items-center">
                                        <p className="text-xs pr-4 text-gray-600">Page { 1 } of { 1 }</p>
                                        <button className="p-1 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"><LuChevronLeft /></button>
                                        <button className="p-1 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"><LuChevronRight /></button>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const formatDate = (date: Date) => {
    // TODO should this be a utility function? (moved to utils dir)
    const formatter = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
    });

    return formatter.format(date);
}

const formatTime = (date: Date) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    return formatter.format(date);
}

export default EventPage;