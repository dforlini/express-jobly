"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const db = require("../src/db");
const { SECRET_KEY } = require("../src/config");

let adminToken;
let userToken;

beforeAll(async () => {
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM jobs");

  await db.query(`
    INSERT INTO companies (handle, name, description, num_employees, logo_url)
    VALUES ('c1', 'Company1', 'Desc1', 100, 'http://c1.img')`);

  await db.query(`
    INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('Job1', 50000, 0.1, 'c1'),
           ('Job2', 60000, 0.2, 'c1')`);

  await db.query(`
    INSERT INTO users (username, password, first_name, last_name, email, is_admin)
    VALUES ('admin', 'password', 'Admin', 'User', 'admin@example.com', true),
           ('user', 'password', 'Normal', 'User', 'user@example.com', false)`);

  const adminUser = await db.query(`
    SELECT username, is_admin FROM users WHERE username = 'admin'`);
  const normalUser = await db.query(`
    SELECT username, is_admin FROM users WHERE username = 'user'`);

  adminToken = jwt.sign(adminUser.rows[0], SECRET_KEY);
  userToken = jwt.sign(normalUser.rows[0], SECRET_KEY);
});

afterAll(async () => {
  await db.end();
});

describe("POST /jobs", () => {
  const newJob = {
    title: "New Job",
    salary: 70000,
    equity: 0.3,
    companyHandle: "c1"
  };

  test("works for admins", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: { id: expect.any(Number), ...newJob }
    });
  });

  test("fails for non-admins", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("fails for anonymous users", async () => {
    const resp = await request(app).post("/jobs").send(newJob);
    expect(resp.statusCode).toEqual(401);
  });
});