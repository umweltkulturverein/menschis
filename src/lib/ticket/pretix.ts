
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


export async function CreateOrder(eventId: string, shiftAttendeeName: string, email: string, shopItemIds: string[]): Promise<string> {
    const pretixConf = getConfig()

    const positions = shopItemIds.map(i => ({
        item: i,
        attendee_name_parts: {
            full_name: shiftAttendeeName
        }
    }))

    const order: PretixOrder = {
        email: email,
        locale: "de-informal",
        positions: positions,
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

export async function CancelOrder(eventId: string, code: string): Promise<boolean> {
    const pretixConf = getConfig()
    const res = await fetch(`https://pretix.eu/api/v1/organizers/${pretixConf.org}/events/${eventId}/orders/${code}/mark_canceled/`, {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": `Token ${pretixConf.apiToken}`},
    })
    // catch already cancelled orders
    if (res.status === 400) {
        const status = await GetOrderStatus(eventId, code)
        if (status === ORDER_STATUS.c) return true;
    }
    if (!res.ok) {
        const resp = await res.text();
        throw new Error(`HTTP ${res.status}: ${resp}`);
    }
    return res.ok;
}

const ORDER_STATUS = {
    n: "pending",
    p: "paid",
    e: "expired",
    c: "canceled",
} as const;

export type OrderStatusCode = keyof typeof ORDER_STATUS;        // "n" | "p" | "e" | "c"
export type OrderStatus = (typeof ORDER_STATUS)[OrderStatusCode]; // "pending" | "paid" | "expired" | "canceled"

async function GetOrderStatus(eventId: string, code: string): Promise<OrderStatus> {
    const pretixConf = getConfig()
    const res = await fetch(`https://pretix.eu/api/v1/organizers/${pretixConf.org}/events/${eventId}/orders/${code}/`, {
        method: "GET",
        headers: {"Content-Type": "application/json", "Authorization": `Token ${pretixConf.apiToken}`},
    })
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const body: { status: OrderStatusCode } = await res.json();
    return ORDER_STATUS[body.status];
}