import Navbar from "../components/Navbar";
import { deleteEvent, getEvents, getRsvps } from "../api/apiService";
import { useEffect, useRef, useState } from "react";
import { Event, RSVP } from "../utils/types";
import { LuEllipsis, LuPencil } from "react-icons/lu";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import Toast, { ToastProps } from "../components/Toast";
import { formatDate, titleCase } from "../utils/formatUtils";

const DashboardPage = () => {
    // States to hold event and rsvp data from the server.
    const [events, setEvents] = useState<any>({});
    const [rsvps, setRsvps] = useState<any>({});

    // States to manage the delete modal and the event to be deleted.
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
    
    // States to manage the ViewEventModal.
    const [isViewEventModalOpen, setIsViewEventModalOpen] = useState(false);
    const [viewEvent, setViewEvent] = useState<Event | null>(null);

    // State for the toast notification.
    const [toast, setToast] = useState<ToastProps | null>(null);
    const [toastVisible, setToastVisible] = useState(false);

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

    const confirmDelete = async () => {
        console.log("Confirmed delete for event:", eventToDelete);
        setIsDeleteModalOpen(false);

        if (!eventToDelete) {
            console.error("No event to delete");
            return;
        }

        try {
            await deleteEvent({ eventId: eventToDelete.id });
            await fetchEvents();

            setToast({
                message: `Event deleted successfully.`,
                type: "success",
                duration: 3000,
                position: "top-right",
                autoClose: true,
                showCloseButton: true,
                visible: toastVisible,
                close: () => setToastVisible(false)
            });

            setToastVisible(true);
        } catch (err: any) {
            console.error("Error deleting event:", err.message);
            setToast({
                message: `Error deleting event: ${err.message}`,
                type: "error",
                duration: 3000,
                position: "top-right",
                autoClose: true,
                showCloseButton: true,
                visible: toastVisible,
                close: () => setToastVisible(false)
            });

            setToastVisible(true);
        }
    };

    return (
        <div className="">
            { toast &&
                <Toast 
                    message={ toast.message }
                    type={ toast.type }
                    duration={ toast.duration }
                    position={ toast.position }
                    autoClose={ toast.autoClose }
                    showCloseButton={ toast.showCloseButton }
                    visible={ toastVisible }
                    close={ toast.close }
                />
            }

            <Navbar />

            <div>
                <div className="mx-6 my-6 bg-gray-100 rounded-md px-2 py-2">
                    {/* Event Details */}
                    <h1 className="text-2xl mb-4"><a href="/events">My Events</a></h1>
                    <div className="">
                        { events?.events?.length > 0 ? (
                            <EventList 
                                events={ events } 
                                setIsDeletedModalOpen={ setIsDeleteModalOpen } 
                                setEventToDelete={ setEventToDelete }
                                setViewEvent={ setViewEvent }
                                setIsViewEventModalOpen={ setIsViewEventModalOpen }
                            />
                        ) : (<p>No events found.</p>) }
                    </div>
                </div>

                <div className="m-6 bg-gray-100 rounded-md p-2">
                    {/* RSVP Details */}
                    <h1 className="text-2xl mb-4"><a href="/rsvps">My RSVPs</a></h1>
                    <div className="">
                        { rsvps?.rsvps?.length > 0 ? (
                           <RSVPList rsvps={ rsvps as { rsvps: RSVP[], length: number, message?: string } } />
                        ) : (<p>No RSVPs found.</p>) }
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal 
                isOpen={ isDeleteModalOpen } 
                onClose={ () => setIsDeleteModalOpen(false) } 
                onConfirm={ confirmDelete }
                eventToDelete={ eventToDelete }
            />

            <ViewEventModal 
                isOpen={ isViewEventModalOpen } 
                onClose={ () => setIsViewEventModalOpen(false) } 
                event={ viewEvent }
            />
        </div>
    );
};


interface EventListProps {
    events: any;
    setIsDeletedModalOpen: (isOpen: boolean) => void;
    setEventToDelete: (event: Event | null) => void;
    setViewEvent: (event: Event | null) => void;
    setIsViewEventModalOpen: (isOpen: boolean) => void;
}

const EventList = ({ events, setIsDeletedModalOpen, setEventToDelete, setViewEvent, setIsViewEventModalOpen }: EventListProps) => {
    const [dropdownId, setDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

        const handleView = () => {
            setDropdownId(null); // Close dropdown after action (particularly for view from dropdown).
            setViewEvent(event);
            setIsViewEventModalOpen(true);
        };

        const handleEdit = () => {
            // Redirect to the event management page.
            window.location.href = `/events?editEventId=${event.id}`;
        };

        const handleDelete = () => {
            console.log("Delete event:", event.title);
            setEventToDelete(event);
            setIsDeletedModalOpen(true);
            setDropdownId(null); // Close dropdown after action
        };

        const handleInvite = () => {
            console.log("Invite to event:", event.title);
        };

        return (
            <li className="relative bg-white shadow-md rounded-lg p-4 grow" key={ key }>
                <div className="flex flex-row justify-between">
                    <h2 className="text-lg"><a href="#" onClick={ handleView } className="hover:text-teal-900">{ event.title }</a></h2>
                    <span className=""><button className="rounded-full hover:bg-gray-100 cursor-pointer p-1" onClick={ () => setDropdownId(key) }><LuEllipsis /></button></span>
                </div>
                {/* <hr className="bg-gray-300 border-0 h-px mb-3" /> */}
                <span className="my-1 block"></span>
                {/* <p className="text-sm text-gray-500">{ event.description }</p> */}
                <p className="text-xs text-gray-500">{ eventDateText }</p>
                <p className="text-xs text-gray-500">{ event.location }</p>

                <div className="flex items-center flex-col">
                    <ul className="flex flex-row gap-2 mt-2 justify-between">
                        <li className="bg-gray-100 rounded-sm p-2 flex flex-col min-w-15">
                            <span className="text-xs text-gray-600 mb-0.5 text-center">RSVPs</span>
                            <span className="text-md text-center">{ totalRsvps }</span>
                        </li>

                        <li className="bg-gray-100 rounded-sm p-2 flex flex-col min-w-15">
                            <span className="text-xs text-gray-600 mb-0.5 text-center">Yes</span>
                            <span className="text-md text-center">{ attendingCount }</span>
                        </li>

                        <li className="bg-gray-100 rounded-sm p-2 flex flex-col min-w-15">
                            <span className="text-xs text-gray-600 mb-0.5 text-center">Maybe</span>
                            <span className="text-md text-center">{ maybeCount }</span>
                        </li>

                        <li className="bg-gray-100 rounded-sm p-2 flex flex-col min-w-15">
                            <span className="text-xs text-gray-600 mb-0.5 text-center">No</span>
                            <span className="text-md text-center">{ declinedCount }</span>
                        </li>
                    </ul>
                </div>

                { dropdownId === key && 
                    <div className="absolute right-5 top-8 z-10 bg-white shadow-md rounded-md w-40" ref={ dropdownRef }>
                    <ul className="text-sm text-gray-700">
                        <li className="hover:bg-gray-100 rounded-t-md">
                            <button className="m-0 p-2 w-full text-left cursor-pointer" onClick={ handleEdit }>Edit</button>
                        </li>
                        <li className="hover:bg-gray-100">
                            <button className="m-0 p-2 w-full text-left cursor-pointer" onClick={ handleInvite }>Invite</button>
                        </li>
                        <li className="hover:bg-gray-100">
                            <button className="m-0 p-2 w-full text-left cursor-pointer" onClick={ handleView }>View</button>
                        </li>
                        <li className="hover:bg-gray-100 rounded-b-md">
                            <button className="m-0 p-2 w-full text-left cursor-pointer" onClick={ handleDelete }>Delete</button>
                        </li>
                    </ul>
                </div>
        }
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

const RSVPList = ({ rsvps }: { rsvps: { rsvps: RSVP[], length: number, message?: string } }) => {
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
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, eventToDelete }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, eventToDelete: Event | null }) => {
    return (
        <Modal isOpen={ isOpen } close={ onClose }>
            <div className="md:w-xl sm:w-sm">
                <h2 className="text-2xl mb-4">Confirm Delete</h2>
                <p>Are you sure you want to delete the event: <strong>{ eventToDelete?.title }</strong>?</p>

                <div className="flex flex-row justify-end mt-4 gap-4">
                    <button className="px-4 py-2 bg-gray-200 hover:bg-gray-100 rounded-md cursor-pointer" onClick={ onClose }>Cancel</button>
                    <button className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-md cursor-pointer" onClick={ onConfirm }>Delete</button>
                </div>
            </div>
        </Modal>
    );
};

const ViewEventModal = ({ isOpen, onClose, event }: { isOpen: boolean, onClose: () => void, event: Event | null }) => {
    if (!event)
        return null;

    return (
        <Modal isOpen={ isOpen } close={ onClose }>
            <div className="md:w-xl sm:w-sm">
                <h2 className="text-2xl mb-2">{ event.title }</h2>
                <Badge 
                    className="mb-4"
                    text={ titleCase(event.status) } 
                    color={ event.status === "UPCOMING" ? "blue" : event.status === "ONGOING" ? "green" : event.status === "COMPLETED" ? "gray" : "red" } 
                />
                <p className="text-sm text-gray-500">Created by: { event.creator?.firstName } { event.creator?.lastName }</p>
                <p className="text-sm text-gray-500">{ formatDate(new Date(event.startDate)) } {event.endDate?` - ${formatDate(new Date(event.endDate))}`: ""}</p>
                <p className="text-sm text-gray-500">{ event.location }</p>

                

                <p className="text-sm my-3 ml-2">{ event.description }</p>

                { event.rsvps && 
                    <div className="flex items-center flex-col bg-gray-100 p-2 rounded-md my-4 w-full">
                        <ul className="flex flex-row gap-2 justify-between">
                            <li className="flex flex-col items-center bg-white rounded-sm p-2 min-w-15">
                                <span className="text-xs text-gray-600 mb-0.5 text-center">RSVPs</span>
                                <span className="text-md text-center">{ event.rsvps.length }</span>
                            </li>
                            <li className="flex flex-col items-center bg-white rounded-sm p-2 min-w-15">
                                <span className="text-xs text-gray-600 mb-0.5 text-center">Yes</span>
                                <span className="text-md text-center">{ event.rsvps.filter((rsvp: RSVP) => rsvp.status === 'ACCEPTED').length }</span>
                            </li>
                            <li className="flex flex-col items-center bg-white rounded-sm p-2 min-w-15">
                                <span className="text-xs text-gray-600 mb-0.5 text-center">No</span>
                                <span className="text-md text-center">{ event.rsvps.filter((rsvp: RSVP) => rsvp.status === 'DECLINED').length }</span>
                            </li>
                            <li className="flex flex-col items-center bg-white rounded-sm p-2 min-w-15">
                                <span className="text-xs text-gray-600 mb-0.5 text-center">Maybe</span>
                                <span className="text-md text-center">{ event.rsvps.filter((rsvp: RSVP) => rsvp.status === 'MAYBE').length }</span>
                            </li>
                        </ul>
                    </div>
                }

                <div className="flex flex-row justify-end mt-4">
                    <button 
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md cursor-pointer" 
                        onClick={ onClose }
                    >
                            Close
                    </button>
                    <button 
                        className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-md cursor-pointer ml-2" 
                        onClick={ () => { console.log("Gp to manage event page:", event.title); onClose(); } }
                    >
                        Manage
                    </button>
                </div>

            </div>
        </Modal>
    );
}

export default DashboardPage;