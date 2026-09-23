import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Perform server-side check
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // If not logged in, redirect to login
    if (!session?.user) {
        redirect("/login");
    }

    // If logged in but not an admin, redirect to home
    const isSysAdmin = (session.user as any).role === "admin";
    if (!isSysAdmin) {
        redirect("/");
    }

    return <>{children}</>;
}
