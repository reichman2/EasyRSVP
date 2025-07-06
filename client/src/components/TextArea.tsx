import React from 'react';


interface TextAreaProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    label?: string;
    error?: boolean;
    rows?: number;
}

const Input = ({ className, label, placeholder, autoFocus, value, name, rows, onChange, error }: TextAreaProps) => {
    return (
        <textarea 
            className={ `${className} block w-full border-0 rounded-md bg-white p-1.5 text-sm outline-1 -outline-offset-1 ${error? "outline-red-600" : "outline-gray-300"} focus:outline-teal-700 focus:outline-2 focus:-outline-offset-2` }
            name={ name }
            placeholder={ placeholder }
            aria-label={ label }
            autoFocus={ autoFocus }
            value={ value }
            rows={ rows || 2 }
            onChange={ onChange }
        >
        </textarea>
    );
}

export default Input;