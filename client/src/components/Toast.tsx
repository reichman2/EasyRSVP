import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export interface ToastProps {
    /**
     * The message to display in the toast.
     */
    message: string;

    /**
     * The type of toast, which determines its style.
     * Can be "success", "error", "warn", or "info".
     */
    type?: "success" | "error" | "warn" | "info";

    /**
     * The duration in milliseconds for which the toast should be visible.
     * If not provided, the toast will remain visible until closed manually.
     */
    duration?: number;

    /**
     * The position of the toast on the screen.
     * Can be "top-right", "top-left", "bottom-right", or "bottom-left".
     */
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";

    /**
     * Whether the toast should automatically close after the specified duration.
     * Defaults to true if duration is provided.
     */
    autoClose?: boolean;

    /**
     * Whether to show a close button on the toast.
     * Defaults to false.
     */
    showCloseButton?: boolean;

    /**
     * The icon to show in the toast.
     */
    icon?: React.ReactNode;

    /**
     * Whether the toast is currently visible.
     * This is used to control the visibility of the toast in the UI.
     * It should be managed by the parent component to show or hide the toast.
     */
    visible: boolean;

    /**
     * Function to call when the toast is closed either by user action or automatically.
     * This can be used to clean up or reset state related to the toast.
     */
    close: () => void;
}

const Toast = ({ message, type, visible, duration, position, autoClose, showCloseButton, close }: ToastProps) => {
    // Default values for optional props
    type = type || "info";
    duration = duration || 3000; // Default to 3 seconds
    position = position || "top-right";
    autoClose = autoClose !== undefined ? autoClose : true; // Default to true if duration is provided
    showCloseButton = showCloseButton !== undefined ? showCloseButton : false;

    // Effect to handle auto-close functionality
    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                close();
            }, duration);

            // Cleanup timer on unmount or when autoClose changes
            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, close]);

    const toastStyles = {
        "error": "bg-red-100 text-red-800 border-red-200",
        "success": "bg-green-100 text-green-800 border-green-200",
        "warn": "bg-yellow-100 text-yellow-800 border-yellow-200",
        "info": "bg-white text-gray-800 border-gray-200"
    };

    return (
        <AnimatePresence>
            { visible && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`fixed top-4 right-4 rounded-md p-3 shadow-lg z-100 min-w-xs border ${toastStyles[type]}`}
            >
                <div className="flex flex-row justify-between w-full h-full items-center">
                    <p className="text-sm">{message}</p>
                    { showCloseButton && (
                    <button
                        className="m-0 p-0 opacity-75 hover:opacity-100 cursor-pointer"
                        onClick={ close }
                        >
                            &times;
                    </button>
                    )}
                </div>
            </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;