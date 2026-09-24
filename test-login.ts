import { authClient } from "./src/lib/auth-client";
async function run() {
    const res = await authClient.signIn.email({ email: "test2@gmail.com", password: "password123" });
    console.log(res);
}
run();
