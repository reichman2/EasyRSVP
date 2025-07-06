import React from 'react';


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    label?: string;
    error?: boolean;
}

const Input = ({ className, label, placeholder, type, autoFocus, value, name, onChange, error }: InputProps) => {
    return (
        <input 
            className={ `${className} block w-full border-0 rounded-md bg-white p-1.5 text-sm outline-1 -outline-offset-1 ${error? "outline-red-600" : "outline-gray-300"} focus:outline-teal-700 focus:outline-2 focus:-outline-offset-2` }
            name={ name }
            placeholder={ placeholder }
            type={ type }
            aria-label={ label }
            autoFocus={ autoFocus }
            value={ value }
            onChange={ onChange }
        />
    );
}

export default Input;