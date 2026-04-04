export const StringToColour = (str: string) => {
    let hash = 0;
    str.split("").forEach((char) => {
        hash = char.charCodeAt(0) + ((hash << 5) - hash);
    });
    let out = "#";
    for (let i = 0; i < 3; i++) {
        const c = (hash >> (i * 8)) & 0xff;
        out += c.toString(16).padStart(2, "0");
    }
    console.log(out);
    return out;
};
