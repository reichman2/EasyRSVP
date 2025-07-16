import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { deleteEvent, getEvents, modifyEvent } from "../api/apiService";
import Badge from "../components/Badge";
import { LuChevronLeft, LuChevronRight, LuMail, LuPencil, LuTrash2 } from "react-icons/lu";
import { Event } from "../utils/types";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import { createEvent } from "../api/apiService";
import TextArea from "../components/TextArea";
import Toast, { ToastProps } from "../components/Toast";

const EventPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [toast, setToast] = useState<ToastProps | null>(null);
    const [toastVisible, setToastVisible] = useState(false);

    const [events, setEvents] = useState<any>({});

    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
    const [editEventModalOpen, setEditEventModalOpen] = useState(false);

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

    return (
        <div>
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
            <EventTable 
                openCreateEventModal={ () => setIsCreateModalOpen(true) } 
                setToast={ setToast }
                toastVisible={ toastVisible }
                setToastVisible={ setToastVisible }
                events={ events }
                fetchEvents={ fetchEvents }
                setEventToEdit={ setEventToEdit }
                setEditEventModalOpen={ setEditEventModalOpen }
            />
            <CreateEventModal 
                isOpen={ isCreateModalOpen } 
                onClose={ () => setIsCreateModalOpen(false) } 
                setToast={ setToast }
                toastVisible={ toastVisible }
                setToastVisible={ setToastVisible }
                fetchEvents={ fetchEvents }
            />
            <EditEventModal 
                isOpen={ editEventModalOpen } 
                onClose={ () => setEditEventModalOpen(false) } 
                event={ eventToEdit }
                setToast={ setToast }
                toastVisible={ toastVisible }
                setToastVisible={ setToastVisible }
                fetchEvents={ fetchEvents }
            />
        </div>
    );
};


interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    setToast: (toast: ToastProps | null) => void;
    toastVisible: boolean;
    setToastVisible: (visible: boolean) => void;
    fetchEvents: () => Promise<any>;
    event?: Event;
}

const CreateEventModal = ({ isOpen, onClose, setToast, toastVisible, setToastVisible, fetchEvents, event }: CreateEventModalProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [location, setLocation] = useState("");

    const [titleError, setTitleError] = useState("");
    const [startDateError, setStartDateError] = useState("");

    const closeModal = () => {
        setTitle("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setLocation("");
        setTitleError("");
        setStartDateError("");
        onClose();
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form data
        if (!title) {
            setTitleError("Event title is required.");
        } else {
            setTitleError("");
        }

        if (!startDate) {
            setStartDateError("Start date is required.");
        } else {
            setStartDateError("");
        }

        if (!title || !startDate) {
            console.error("Event title and start date are required.");
            return;
        }

        // Make API call to create event
        try {
            await createEvent({
                title,
                description,
                startDate: new Date(startDate).toISOString(),
                endDate: endDate? new Date(endDate).toISOString() : "",
                location
            });

            closeModal();

            setToast({
                message: "Event created successfully!",
                type: "success",
                position: "top-right",
                autoClose: true,
                showCloseButton: true,
                icon: null,
                visible: toastVisible,
                close: () => setToastVisible(false)
            });

            setToastVisible(true);
            await fetchEvents();
        } catch (error) {
            console.error("Error creating event:", error);

            setToast({
                message: error instanceof Error? error.message : "An error occurred while creating the event.",
                type: "error",
                position: "top-right",
                autoClose: true,
                showCloseButton: true,
                icon: null,
                visible: toastVisible,
                close: () => setToastVisible(false)
            });

            setToastVisible(true);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setStartDate(value);


        const date = new Date(value);
        const datePlusTwoHours = new Date(date.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
        
        const formattedDate = convertDateToInputFormat(datePlusTwoHours);
        setEndDate(formattedDate);
    }

    return (
        <Modal isOpen={ isOpen } close={ closeModal }>
            <div className="md:w-xl sm:w-sm">
                <h2 className="text-2xl mb-4">Create Event</h2>
                <form className="space-y-4" onSubmit={ handleSubmit }>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Event Title</label>
                        <Input 
                            name="new-event-title" 
                            type="text" 
                            error={ !!titleError } 
                            value={ title }
                            onChange={ (e) => setTitle(e.target.value) }
                            onBlur={ (e) => setTitleError(e.target.value? "" : "Event title is required.") }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <TextArea 
                            name="new-event-desc" 
                            rows={ 4 } 
                            value={ description }
                            onChange={ (e) => setDescription(e.target.value) }
                        />
                    </div>
                    <div className="flex flex-row justify-between space-x-4">
                        <div className="grow">
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <Input 
                                name="new-event-start" 
                                type="datetime-local" 
                                error={ !!startDateError } 
                                value={ startDate }
                                onChange={ handleDateChange } 
                            />
                        </div>
                        <div className="grow">
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <Input 
                                name="new-event-end" 
                                type="datetime-local" 
                                value={ endDate }
                                onChange={ (e) => setEndDate(e.target.value) }
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <Input 
                            name="new-event-location" 
                            type="text" 
                            value={ location }
                            onChange={ (e) => setLocation(e.target.value) }
                        />
                    </div>
                    <Button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Create Event</Button>
                </form>
            </div>
        </Modal>
    )
};

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event | null;
    setToast: (toast: ToastProps | null) => void;
    toastVisible: boolean;
    setToastVisible: (visible: boolean) => void;
    fetchEvents: () => Promise<any>;
}

const EditEventModal = ({ isOpen, onClose, event, setToast, toastVisible, setToastVisible, fetchEvents }: EditEventModalProps) => {
    if (!event) {
        return null;
    }

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        if (!event || !event.endDate) {
            return;
        }

        setTitle(event.title);
        setDescription(event.description);
        setStartDate(convertDateToInputFormat(event.startDate));
        setEndDate(convertDateToInputFormat(event.endDate));
        setLocation(event.location);
    }, [event, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !startDate) {
            setToast({
                message: "Event title and start date are required.",
                type: "error",
                position: "top-right",
                autoClose: true,
                showCloseButton: true,
                icon: null,
                visible: toastVisible,
                close: () => setToastVisible(false)
            });
            setToastVisible(true);
            return;
        }

        try {
            await modifyEvent({
                eventId: event.id,
                title,
                description,
                startDate: new Date(startDate).toISOString(),
                endDate: endDate? new Date(endDate).toISOString() : "",
                location
            });

            onClose();
            setToast({
                message: "Event updated successfully!",
                type: "success",
                position: "top-right",
                autoClose: true,
                showCloseButton: true,
                icon: null,
                visible: toastVisible,
                close: () => setToastVisible(false)
            });

            setToastVisible(true);
            await fetchEvents();
        } catch (error) {
            console.error("Error updating event:", error);

            setToast({
                message: error instanceof Error? error.message : "An error occurred while updating the event.",
                type: "error",
                position: "top-right",
                autoClose: true,
                showCloseButton: true,
                icon: null,
                visible: toastVisible,
                close: () => setToastVisible(false)
            });

            setToastVisible(true);
        }
    };

    const handleClose = (e: React.MouseEvent) => {
        e.preventDefault();
        onClose();
    };

    return (
        <Modal isOpen={ isOpen } close={ onClose }>
            <div className="md:w-xl sm:w-sm">
                <h2 className="text-2xl mb-4">Edit Event</h2>
                <form className="space-y-4" onSubmit={ handleSubmit }>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Event Title</label>
                        <Input 
                            name="edit-event-title" 
                            type="text" 
                            value={ title }
                            onChange={ (e) => setTitle(e.target.value) }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Event Description</label>
                        <TextArea 
                            name="new-event-desc" 
                            rows={ 4 } 
                            value={ description }
                            onChange={ (e) => setDescription(e.target.value) }
                        />
                    </div>
                    <div className="flex flex-row justify-between space-x-4">
                        <div className="grow">
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <Input 
                                type="datetime-local"
                                name="edit-start-date"
                                value={ startDate }
                                onChange={ (e) => setStartDate(e.target.value) }
                            />
                        </div>
                        <div className="grow">
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <Input
                                type="datetime-local"
                                name="edit-end-date"
                                value={ endDate }
                                onChange={ (e) => setEndDate(e.target.value) }
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <Input
                            type="text"
                            name="edit-location"
                            value={ location }
                            onChange={ (e) => setLocation(e.target.value) }
                        />
                    </div>
                    <div className="flex flex-row justify-between space-x-8">
                        <button className="rounded-md cursor-pointer w-full text-sm py-1.5 bg-gray-200 font-medium" onClick={ handleClose }>Cancel</button>
                        <Button type="submit" className="py-1.5">Update Event</Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

interface EventTableProps {
    openCreateEventModal: () => void;
    setToast: (toast: ToastProps) => void;
    toastVisible: boolean;
    setToastVisible: (visible: boolean) => void;
    events: any;
    fetchEvents: () => Promise<any>;
    setEventToEdit: (event: Event | null) => void;
    setEditEventModalOpen: (isOpen: boolean) => void;
}

const EventTable = ({ openCreateEventModal, setToast, toastVisible, setToastVisible, events, fetchEvents, setEventToEdit, setEditEventModalOpen }: EventTableProps) => {
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

    const deleteEventHandler = async (eventId: string) => {
        console.log("Deleting event with ID:", eventId);

        try {
            await deleteEvent({ eventId });
            await fetchEvents();

            setToast({
                message: "Event deleted successfully!",
                type: "success",
                position: "top-right",
                autoClose: true,
                showCloseButton: true,
                icon: null,
                visible: toastVisible,
                close: () => setToastVisible(false)
            });

            setToastVisible(true);
        } catch (error: any) {
            console.error("Error deleting event:", error.message);
            setToast({
                message: error instanceof Error? error.message : "An error occurred while deleting the event.",
                type: "error",
                position: "top-right",
                autoClose: true,
                showCloseButton: true,
                icon: null,
                visible: toastVisible,
                close: () => setToastVisible(false)
            });

            setToastVisible(true);
            return;
        }
    };

    const openInviteModal = (e: React.MouseEvent, event: Event) => {
        console.log("Invite button pressed for event:", event);
        e.stopPropagation();
        // TODO Open the invite modal and pass the event details
    };

    const openEditEventModal = (event: Event) => {
        setEventToEdit(event);
        setEditEventModalOpen(true);
    };

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
                    <button className="cursor-pointer hover:text-yellow-500" onClick={ () => openEditEventModal(event) }><LuPencil /></button>
                    <button className="cursor-pointer hover:text-blue-700" onClick={ (e) => openInviteModal(e, event) }><LuMail /></button>
                    <button className="cursor-pointer hover:text-red-700" onClick={ () => deleteEventHandler(event.id) }><LuTrash2 /></button>
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
                            <Button onClick={ () => openCreateEventModal() } className="ml-auto px-3 py-1.5 hover:bg-teal-700">+ Create Event</Button>
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
};

const convertDateToInputFormat = (date: Date | string) => {
    // Ensure the date is of type Date;
    if (typeof date === "string") {
        date = new Date(date);
    }

    // Account for timezone offset
    const timezoneOffset = date.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
    const adjustedDate = new Date(date.getTime() - timezoneOffset);

    // Format the date to match the input type="datetime-local" format
    const formattedDate = adjustedDate.toISOString().slice(0, 16);

    return formattedDate;
};

export default EventPage;