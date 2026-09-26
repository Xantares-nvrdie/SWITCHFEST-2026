import { Elysia, t } from "elysia";

const app = new Elysia()
  .patch("/", ({ body }) => body, {
    body: t.Object({
      fields: t.Optional(t.Array(t.Any())),
    })
  })
  .listen(3001);

console.log("Listening on 3001");

setTimeout(async () => {
    const res = await fetch("http://localhost:3001/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: [{ name: "test", sortOrder: 0 }] })
    });
    console.log(await res.json());
    process.exit(0);
}, 1000);
