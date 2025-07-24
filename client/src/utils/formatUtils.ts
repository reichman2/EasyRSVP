export const formatDate = (date: Date) => {
    // TODO should this be a utility function? (moved to utils dir)
    const formatter = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
    });

    return formatter.format(date);
}

export const formatTime = (date: Date) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    return formatter.format(date);
};

export const convertDateToInputFormat = (date: Date | string) => {
    // Ensure the date is of type Date;
    if (typeof date === "string") {
        date = new Date(date);
    }

    // Account for timezone offset
    const timezoneOffset = date.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
    const adjustedDate = new Date(date.getTime() - timezoneOffset);

    // Format the date to match the input type="datetime-local" format
    const formattedDate = adjustedDate.toISOString().slice(0, 16);

    return formattedDate;
};

export const titleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}