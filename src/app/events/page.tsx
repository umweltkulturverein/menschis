import Image from "next/image";
import NavBar from "@/components/Navigation/NavBar";
import EventPanel from "@/components/Events/EventPanel";
import EventSummary from "@/components/Events/EventSummary";

export default function Home() {
    return (
        <div className="flex min-h-screen bg-zinc-50 p-8 font-sans dark:bg-ci-blue-800">
            <EventSummary />
        </div>
    );
}
