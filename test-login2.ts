import { authClient } from "./src/lib/auth-client";
async function run() {
    console.log("Registering...");
    const reg = await authClient.signUp.email({ email: "newuser123@gmail.com", password: "password123", name: "New User" });
    console.log("Reg:", reg.error ? reg.error : "Success");
    
    console.log("Logging in...");
    const res = await authClient.signIn.email({ email: "newuser123@gmail.com", password: "password123" });
    console.log("Login:", res.error ? res.error : "Success");
}
run();
