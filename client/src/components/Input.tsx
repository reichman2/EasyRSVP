import React from 'react';


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    label?: string;
    error?: string;
}

const Input = ({ className, placeholder, type }: InputProps) => {
    return (
        <input 
            className={ `${className} border border-gray-300 rounded-sm p-1 text-sm w-full outline-0 focus:border-teal-700 focus:border-2` }
            placeholder={ placeholder }
            type={ type }
        />
    );
}

export default Input;