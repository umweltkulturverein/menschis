
interface PretixOrder {
    email: string;
    code?:string;
    locale: string;
    testmode?: boolean;
    simulate?: boolean;
    positions: PretixPosition[];
    send_email: boolean;
}
interface PretixPosition {
    item: string;
    subevent?: string;
    attendee_name_parts: PretixAttendeeNameParts;

}
interface PretixAttendeeNameParts {
    full_name: string;
}


export async function CreateOrder(eventId: string, shiftAttendeeName: string, email: string, shopItem: string, subeventId?: string): Promise<string> {
    const pretixConf = getConfig()
    const order: PretixOrder = {
        email: email,
        locale: "de-informal",
        positions: [{
            item: shopItem,
            subevent: subeventId,
            attendee_name_parts: {
                full_name: shiftAttendeeName
            }
        }],
        send_email: true

    }

    const res = await fetch(`https://pretix.eu/api/v1/organizers/${pretixConf.org}/events/${eventId}/orders/`, {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": `Token ${pretixConf.apiToken}`},
        body: JSON.stringify(order)
    })
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const body: PretixOrder = await res.json();
    return body.code || "";
}

interface PretixConfig {
    org: string;
    apiToken: string;
}
let config: PretixConfig | null = null;

function getConfig(): PretixConfig {
    if (config) return config;

    const org = process.env.PRETIX_ORG;
    const apiToken = process.env.PRETIX_API_TOKEN;

    if (!apiToken ) throw new Error("PRETIX_API_TOKEN not set. Required for issuing and canceling tickets.")
    if (!org ) throw new Error("PRETIX_ORG not set. Required for issuing and canceling tickets.");
    config = { org, apiToken};
    return config;
}

export async function CancelOrder(eventName: string, code: string): Promise<boolean> {
    const pretixConf = getConfig()
    const res = await fetch(`https://pretix.eu/api/v1/organizers/${pretixConf.org}/events/${eventName}/orders/${code}/mark_canceled/`, {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": `Token ${pretixConf.apiToken}`},
    })
    return res.status === 204;


}