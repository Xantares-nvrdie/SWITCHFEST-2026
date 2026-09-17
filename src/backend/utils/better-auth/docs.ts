import { auth } from "@/auth";

export const AuthDocs = async () => {
    const raw = await auth.api.generateOpenAPISchema();
    const oldPaths = raw.paths as Record<string, Record<string, unknown>>;

    const newPaths: Record<string, Record<string, unknown>> = {};
    const prefix = "/api/auth";

    const methodOrder = ["get", "post", "put", "patch", "delete"];

    for (const path in oldPaths) {
        const pathItem = oldPaths[path];
        const sortedPathItem: Record<string, unknown> = {};

        const keys = Object.keys(pathItem);

        keys.sort((a, b) => {
            if (!methodOrder.includes(a)) return -1;
            if (!methodOrder.includes(b)) return 1;

            return methodOrder.indexOf(a) - methodOrder.indexOf(b);
        });

        for (const key of keys) {
            if (typeof pathItem[key] === "object" && pathItem[key] !== null) {
                if (path.includes("/admin")) {
                    (pathItem[key] as Record<string, unknown>).tags = ["Admin"];
                } else {
                    (pathItem[key] as Record<string, unknown>).tags = ["Auth"];
                }
            }

            sortedPathItem[key] = pathItem[key];
        }

        const newKey = `${prefix}${path}`;

        newPaths[newKey] = sortedPathItem;
    }

    raw.paths = newPaths;

    if (raw.components?.schemas) {
        // @ts-expect-error
        delete raw.components.schemas;
    }

    return raw;
};
