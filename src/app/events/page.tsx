import Image from "next/image";
import NavBar from "@/components/Navigation/NavBar";
import EventPanel from "@/components/Events/EventPanel";

export default function Home() {
    return (
        <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
            <EventPanel
                event={{
                    Title: "Hello Event",
                    Description: "This is a sample event description.",
                    StartDate: new Date("2025-07-01"),
                    EndDate: new Date("2025-07-02"),
                    Location: "Virtual",
                }}
            />
        </div>
    );
}
