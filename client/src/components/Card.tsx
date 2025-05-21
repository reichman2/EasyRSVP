import React from 'react';

interface CardProps extends React.PropsWithChildren {
    className?: string;
}

const Card = (props: CardProps) => {
    const { children, className } = props;

    return (
        <div className={ `${className}` }>
            <div className="bg-white shadow-sm rounded-lg hover:shadow-md transition-shadow duration-300">
                { children }
            </div>
        </div>
    )
}


export default Card;