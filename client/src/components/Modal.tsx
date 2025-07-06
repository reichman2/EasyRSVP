import React from "react";
import ReactDOM from "react-dom";


interface ModalProps extends React.PropsWithChildren {
    isOpen: boolean;
    close: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, close, children }) => {
    if (!isOpen)
        return null;


    return ReactDOM.createPortal(
        <div className="w-full h-full fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-black opacity-30 fixed top-0 right-0 w-full h-full" onClick={ close }></div>
            <div className="">
                <div className="bg-white rounded-lg shadow-lg p-6 relative">
                    <button
                        className="absolute top-3 right-4.5 text-gray-500 hover:text-gray-700 cursor-pointer"
                        onClick={ close }
                    >
                        &times;
                    </button>

                    { children }

                </div>
            </div>
        </div>,
        document.body
    );
};


export default Modal;