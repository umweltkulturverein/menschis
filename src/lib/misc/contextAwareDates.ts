// DatetimeStrings look Annatural and are Painful for the Eyes. This Function compares the DateTime String
// with the Current DateTime and Returns a good looking one

export function NaturalDateTime(dateTime: Date): string {
    const currentDateTime = new Date();
    const timePart = dateTime.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
    });
    if (currentDateTime.toDateString() === dateTime.toDateString()) {
        return NaturalTime(dateTime);
    }
    const naturalDate = NaturalDate(dateTime);
    return `${naturalDate} - ${timePart}`;
}

export function NaturalTime(dateTime: Date): string {
    const currentDateTime = new Date();
    const diffMs = dateTime.getTime() - currentDateTime.getTime();
    const diffMin = Math.round(diffMs / 60000); // 1 Minute
    const diffHours = Math.round(diffMs / 3600000); // 1 Hour

    if (Math.abs(diffMin) < 1) return "Now";
    if (Math.abs(diffMin) < 60) {
        if (diffMin < 0) return `${Math.abs(diffMin)} Minutes ago`;
        return `in ${diffMin} Minutes`;
    }
    if (diffHours < 0) return `${Math.abs(diffHours)} Hours ago`;
    return `in ${diffHours} Hours`;
}

export function NaturalDate(date: Date): string {
    const currentDateTime = new Date();
    if (currentDateTime.getFullYear() !== date.getFullYear()) {
        return date.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        });
    }
    return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
    });
}
