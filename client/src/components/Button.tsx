import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    onClick?: () => void;
}

const Button = ({ children, className, onClick, type }: ButtonProps) => {

    return (
        <button
            className={ `${className} rounded-md cursor-pointer w-full text-sm bg-teal-800 text-white py-1 font-medium` } 
            onClick={ onClick }
            type={ type }
        >
            { children }
        </button>
    )
}


export default Button;