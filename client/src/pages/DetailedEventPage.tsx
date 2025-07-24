import { Navigate, useParams } from "react-router";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { Event } from "../utils/types";
import { getDetailedEvent, getEvents, inviteAttendees } from "../api/apiService";
import { formatDate, titleCase } from "../utils/formatUtils";
import Input from "../components/Input";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Toast, { ToastProps } from "../components/Toast";
import { LuMail, LuPencilLine, LuTrash2 } from "react-icons/lu";

export const DetailedEventPage = () => {
    // State for the toast notification.
    const [toasts, setToasts] = useState<{ props: ToastProps, visible: boolean }[]>([]);

    const addToast = (props: ToastProps) => {
        setToasts((prevToasts) => [...prevToasts, { props, visible: true }]);
    };

    const removeToast = (index: number) => {
        setToasts((prevToasts) => prevToasts.filter((_, i) => i !== index));
    };

    const popToast = (index: number) => {
        setToasts((prevToasts) => {
            const newToasts = [...prevToasts];
            newToasts[index].visible = false;
            return newToasts;
        });
    };

    const { id } = useParams();

    const [event, setEvent] = useState<Event | null>(null);

    if (!id) {
        return <Navigate to="/events" />
    }

    const fetchEvent = async (eventId: string) => {
        let eventData;
        try {
            eventData = await getDetailedEvent({ eventId });

            if (eventData) {
                setEvent(eventData as any as Event);
            }
        } catch (err: any) {
            console.error("An error occurred while fetching the event.", err);
            console.log(err.message);
            if (err.message === "You are not authorized to view this event.") {
                // Handle unauthorized access
                window.location.href = "/dashboard";
            }
        }
    };

    useEffect(() => {
        fetchEvent(id);
    }, []);

    return (
        <div>
            { toasts.map((toastData, idx) => {
                const props = toastData.props;

                return <Toast
                    key={ idx }
                    message={ props.message }
                    visible={ props.visible }
                    close={ props.close }
                    type={ props.type }
                    duration={ props.duration }
                    autoClose={ props.autoClose }
                    showCloseButton={ props.showCloseButton }
                />
            })}

            <Navbar />

            <DetailedEventPanel event={ event } />
        </div>
    );
};


const DetailedEventPanel = ({ event }: { event: Event | null }) => {
    const [currentTab, setCurrentTab] = useState(0);
    
    if (!event) {
        console.log("No Event", event);
        return null;
    }

    const tabElements = [
        {tabName: "Event Details", element: <BasicDetailsTab event={ event } />},
        {tabName: "Attendees", element: <AttendeesTab event={ event } />},
        {tabName: "Invite", element: <InviteTab event={ event } />}
    ];

    return (
        <div className="m-12 bg-gray-100 rounded-md">
            <div className="py-2">
                <ul className="flex space-x-4 mb-4 ml-2">
                    { tabElements.map((e, idx) => {
                        return (
                            <li 
                                className={ `${currentTab === idx? "cursor-default bg-gray-300/50": "hover:text-gray-600 cursor-pointer"} py-1.5 px-4 rounded-md text-sm font-medium` }
                                style={{ WebkitTapHighlightColor: "transparent" }}
                                key={ idx }
                                onClick={ () => setCurrentTab(idx) }
                            >
                                { e.tabName }
                            </li>
                        );
                    })}
                </ul>

                <div className="p-4 m-2 rounded-md bg-white">
                    {
                        tabElements[currentTab].element
                    }
                </div>
            </div>
            

        </div>
    );
};

const BasicDetailsTab = ({ event }: { event: Event }) => {
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
        <div>
            <h1 className="text-xl">{ event.title }</h1>
            <div className="ml-0.5 mb-2">
                <p className="text-xs text-gray-700">{ eventDateText }</p>
                <p className="text-xs text-gray-700">{ event.location }</p>
            </div>

            <p className="text-sm">{ event.description }</p>
        </div>
    );
};

const AttendeesTab = ({ event }: { event: Event }) => {
    if (!event.rsvps)
        return null;

    const STATUS_BADGES = {
        ACCEPTED: <Badge text="Accepted" color="green" />,
        MAYBE: <Badge text="Maybe" color="yellow" />,
        DECLINED: <Badge text="Declined" color="red" />,
        PENDING: <Badge text="Pending" color="gray" />
    };

    const attendeeRows = event.rsvps.map((rsvp, idx) => {
        return (
            <tr key={ idx } className={`border-gray-200 text-sm ${event.rsvps!.length - 1 === idx ? "" : "border-b"}`}>
                <td scope="row" className="py-3 px-4 text-sm">{ rsvp.name }</td>
                <td scope="row" className="py-3 px-4 text-sm text-center">{ rsvp.email }</td>
                <td scope="row" className="py-3 px-4 text-sm text-center">{ formatDate(new Date(rsvp.createdAt)) }</td>
                <td scope="row" className="py-3 px-4 text-sm text-center">{ STATUS_BADGES[rsvp.status] }</td>
                <td scope="row" className="py-3 px-4 ">
                    <div className="flex justify-center items-center space-x-4">
                        <button className="cursor-pointer hover:text-yellow-500"><LuPencilLine /></button>
                        <button className="cursor-pointer hover:text-blue-700"><LuMail /></button>
                        <button className="cursor-pointer hover:text-red-700"><LuTrash2 /></button>
                    </div>
                </td>
            </tr>
        );
    });

    if (attendeeRows.length === 0) {
        return (
            <div className="">
                <h1 className="text-xl mb-2">Attendees</h1>
                <div className="text-sm ml-0.5">
                    <p className="text-gray-500">No attendees have RSVP'd yet.</p>
                    <p className="text-gray-500">You can invite attendees using the "Invite" tab.</p>
                    <p className="text-gray-500">Once they RSVP, they will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-xl mb-4">Attendees</h1>

            <div>
                <table className="table-auto md:table-fixed min-w-full">
                    <thead>
                        <tr className="text-gray-600 border-b border-gray-200">
                            <th scope="col" className="pb-2 uppercase font-light text-xs">Name</th>
                            <th scope="col" className="pb-2 uppercase font-light text-xs">Email</th>
                            <th scope="col" className="pb-2 uppercase font-light text-xs">RSVP Date</th>
                            <th scope="col" className="pb-2 uppercase font-light text-xs">Status</th>
                            <th scope="col" className="pb-2 uppercase font-light text-xs">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        { attendeeRows }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const InviteTab = ({ event }: { event: Event | null }) => {
    type Invitee = {
        name: string;
        email: string;
    };

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");

    const [toInvite, setToInvite] = useState<Invitee[]>([]);

    if (!event) {
        return <p className="text-red-500">No event data available.</p>;
    }

    const removeInvitee = (invitee: Invitee) => {
        const newList = toInvite.filter((e) => e !== invitee);
        setToInvite(newList);
    };

    const addInvitee = (invitee: Invitee) => {
        // Name conditions
        let tempNameError;
        if (invitee.name.length < 3) {
            console.log("INVITEE NAME", invitee.name.length);
            tempNameError = "Name must be longer than 3 characters.";
            setNameError(tempNameError);
        } else {
            setNameError("");
        }

        // Email conditions
        let tempEmailError;
        if (!(/^[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,125}[a-zA-Z]{2,63}$/.test(invitee.email))) { // adjusted from: https://www.regular-expressions.info/email.html
            tempEmailError = "Please enter a valid email.";
            setEmailError(tempEmailError);
        } else {
            setEmailError("");
        }

        if (tempNameError || tempEmailError) {
            return;
        }

        const newList = toInvite.concat(invitee);
        setToInvite(newList);

        setName("");
        setEmail("");

        setNameError("");
        setEmailError("");
    };

    const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>, func: () => void) => {
        if (e.key === "Enter") {
            e.preventDefault();
            func();
        }
    };

    const handleSendInvites = () => {
        inviteAttendees({ eventId: event.id, invitees: toInvite });
        setToInvite([]);
    };

    
    return (
        <div className="">
            <h1 className="text-xl mb-4">Invite Attendees</h1>
            
            <div>
                <div className="flex lg:flex-row flex-col justify-between">

                    <div className="lg:w-1/2 w-full">
                        <div className="lg:w-100 m-auto">
                            <div className="mb-4">
                                <label className="text-xs font-semibold">Name</label>
                                <Input
                                    name="Invitee Name"
                                    type="text"
                                    value={ name }
                                    onChange={ (e) => setName(e.target.value) }
                                    className={ `${nameError? "outline-red-500" : ""}` }
                                />

                                <div className="flex justify-end min-h-4.5">
                                    <p className="text-xs text-red-500 mt-0.5">{ nameError }</p>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-semibold">Email</label>
                                <Input 
                                    name="Invitee Email"
                                    type="email" 
                                    value={ email }
                                    onChange={ (e) => setEmail(e.target.value) }
                                    onKeyDown={ (e) => handleEnterPress(e, () => addInvitee({ name, email })) }
                                    className={ `${emailError? "outline-red-500" : ""}` }
                                />

                                <div className="flex justify-end min-h-4.5">
                                    <p className="text-xs text-red-500 mt-0.5">{ emailError }</p>
                                </div>
                            </div>

                            <div className="lg:w-100">
                                <Button className="w-100" type="button" onClick={ () => addInvitee({ name, email }) }>Add</Button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2 w-full flex flex-col justify-between">
                        <div className="flex flex-row flex-wrap space-x-3">
                            {
                                toInvite.map((e, idx) => {
                                    return (
                                        <Badge 
                                            key={ idx } 
                                            color="lightgray" 
                                            text={ e.name }
                                            closable={ true }
                                            onClose={ () => removeInvitee(e) }
                                            title={ e.email }
                                            showBorder={ true }
                                        />
                                    );
                                })
                            }
                        </div>

                        <div>
                            <Button onClick={ handleSendInvites }>Send Invites</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};