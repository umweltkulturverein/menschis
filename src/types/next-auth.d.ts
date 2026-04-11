import "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            sub?: string | null;
            shiftAccess?: Record<number, string>; // shiftKindID + Token
        };
    }
}
