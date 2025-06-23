type BadgeProps = {
    text: string;
    color: "gray" | "red" | "orange" | "yellow" | "green" | "blue" | "indigo" | "purple" | "pink";
    styles?: string[];
    closable?: boolean;
    onClose?: () => void;
    className?: string;
    showBorder?: boolean;
};


const Badge = ({ text, color, closable, onClose, className, showBorder }: BadgeProps) => {
    const badgeColorClasses = {
        gray: `bg-gray-200 text-gray-800 ${showBorder? "ring-gray-500/10" : ""}`,
        red: `bg-red-200 text-red-800 ${showBorder? "ring-red-600/10" : ""}`,
        orange: `bg-orange-200 text-orange-800 ${showBorder? "ring-orange-600/10" : ""}`,
        yellow: `bg-yellow-200 text-yellow-800 ${showBorder? "ring-yellow-600/10" : ""}`,
        green: `bg-green-200 text-green-800 ${showBorder? "ring-green-600/10" : ""}`,
        blue: `bg-blue-200 text-blue-800 ${showBorder? "ring-blue-600/10" : ""}`,
        indigo: `bg-indigo-200 text-indigo-800 ${showBorder? "ring-indigo-700/10" : ""}`,
        purple: `bg-purple-200 text-purple-800 ${showBorder? "ring-purple-600/10" : ""}`,
        pink: `bg-pink-200 text-pink-800 ${showBorder? "ring-pink-600/10" : ""}`
    };

    return (
        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-md font-medium ${badgeColorClasses[color]} ${className} ${showBorder? "ring-1 ring-inset" : ""}`}>
            {text}
            {closable && (
                <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-80 cursor-pointer">
                    &times;
                </button>
            )}
        </span>
    )
}

export default Badge;