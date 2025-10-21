import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import User from "../models/User";

let server:any;
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cybernauts_test");
  server = app.listen(0);
  await User.deleteMany({});
});
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

test("popularity score logic", async () => {
  const a = (await request(server).post("/api/users").send({ username: "A", age:20, hobbies: ["x","y"] })).body;
  const b = (await request(server).post("/api/users").send({ username: "B", age:21, hobbies: ["x"] })).body;
  const c = (await request(server).post("/api/users").send({ username: "C", age:22, hobbies: ["z"] })).body;

  await request(server).post(`/api/users/${a.id}/link`).send({ targetId: b.id });
  await request(server).post(`/api/users/${a.id}/link`).send({ targetId: c.id });

  const res = await request(server).get("/api/users");
  const ua = res.body.find((u:any)=>u.id===a.id);
  expect(ua.popularityScore).toBeCloseTo(2.5);
});

test("cannot delete while linked", async () => {
  const d = (await request(server).post("/api/users").send({ username: "D", age:30, hobbies: [] })).body;
  const e = (await request(server).post("/api/users").send({ username: "E", age:25, hobbies: [] })).body;
  await request(server).post(`/api/users/${d.id}/link`).send({ targetId: e.id });
  const del = await request(server).delete(`/api/users/${d.id}`);
  expect(del.status).toBe(409);
});

test("prevent duplicate friendship", async () => {
  const f = (await request(server).post("/api/users").send({ username: "F", age:28, hobbies: [] })).body;
  const g = (await request(server).post("/api/users").send({ username: "G", age:29, hobbies: [] })).body;
  const r1 = await request(server).post(`/api/users/${f.id}/link`).send({ targetId: g.id });
  expect(r1.status).toBe(201);
  const r2 = await request(server).post(`/api/users/${g.id}/link`).send({ targetId: f.id });
  expect(r2.status).toBe(409);
});
