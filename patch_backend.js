const fs = require('fs');
const path = 'src/backend/index.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('app.onError')) {
    code = code.replace(
        /const app = new Elysia\(\)\n.*?\.use\(cors\(\)\)/s,
        `$&
    .onError(({ code, error, set }) => {
        if (code === 'NOT_FOUND') return { message: "Route not found" };
        set.status = 500;
        return { message: error.message || "Internal Server Error" };
    })`
    );
    fs.writeFileSync(path, code);
}
