// DatetimeStrings look Annatural and are Painful for the Eyes. This Function compares the DateTime String
// with the Current DateTime and Returns a good looking one

export function NaturalDateTime(dateTime: Date): string {
    const currentDateTime = new Date();
    const timePart = NaturalTime(dateTime);
    if (currentDateTime.toDateString() === dateTime.toDateString()) {
        return timePart;
    }
    const naturalDate = NaturalDate(dateTime);
    return `${naturalDate} ${timePart}`;
}

export function NaturalTime(dateTime: Date): string {
    const currentDateTime = new Date();
    if (currentDateTime.toDateString() !== dateTime.toDateString()) {
        return dateTime.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
        })+ " Uhr";
    }
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
        return (
            date.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
            }) + ","
        );
    }
    return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "short",
    });
}

export function NaturalDateTimeCompare(date1: Date, date2: Date): string {
    const currentDateTime = new Date();
    if (date1.getFullYear() !== currentDateTime.getFullYear()) {
        const rdate1 = NaturalDate(date1);
        const rdate2 = date2.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "short",
        });
        return `${rdate1} - ${rdate2}`;
    }
    if (
        date1.getMonth() !== currentDateTime.getMonth() ||
        date1.getDate() !== date2.getDate()
    ) {
        return NaturalDateTime(date1) + " - " + NaturalDateTime(date2);
    }
    return NaturalDateTime(date1) + " - " + NaturalTime(date2);
}
