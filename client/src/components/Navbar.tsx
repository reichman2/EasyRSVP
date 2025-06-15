import { useState } from "react";
import { LuCircleUser } from "react-icons/lu";


const Navbar = () => {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const navItems = [
        { text: "Dashboard", href: "/dashboard" },
        { text: "Events", href: "/events" },
        { text: "RSVPs", href: "/rsvps" },
    ];

    const profileMenuItems = [
        { text: "Settings", href: "/settings" },
        { text: "Logout", href: "/logout" },
    ];

    return (
        <nav role="navigation" className="mx-6 my-6">
            <div className="shadow-lg">
                <ul className="list-none flex flex-row gap-8 items-start px-4 py-4 bg-teal-950 rounded-lg text-white">
                    <li className="mr-10"><a href="#">Invite.ly</a></li>

                    {navItems.map((item, idx) => (
                        <li key={ idx }><a href={ item.href }>{ item.text }</a></li>
                    ))}

                    <li className="ml-auto" >
                        <div>
                            <button
                                className=" hover:text-gray-200"
                                onClick={ () => setProfileMenuOpen(!profileMenuOpen) }
                            >
                                <a className="" href="#"><LuCircleUser /></a>
                            </button>

                            <div className={ `${profileMenuOpen? "block" : "hidden"} absolute right-2 mt-2 w-48 bg-white rounded-md shadow-lg hover:shadow-xl` }>
                                <ul className=" list-none">
                                    { profileMenuItems.map((item, idx) => (
                                        <li key={ idx }><a href={ item.href } className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{ item.text }</a></li>
                                    )) }
                                </ul>
                            </div>
                        </div>
                    </li>
                </ul>
            </div >
        </nav>
    );
};


export default Navbar;