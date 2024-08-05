"use strict";

const request = require("supertest");

const app = require("../src/app");
const db = require("../src/db");

beforeAll(async () => {
  await db.query("DELETE FROM companies");

  await db.query(`
    INSERT INTO companies (handle, name, description, num_employees, logo_url)
    VALUES ('c1', 'Company1', 'Desc1', 100, 'http://c1.img'),
           ('c2', 'Company2', 'Desc2', 200, 'http://c2.img'),
           ('c3', 'Company3', 'Desc3', 300, 'http://c3.img')`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("works: no filter", async () => {
    const resp = await request(app).get("/companies");
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      companies: [
        { handle: "c1", name: "Company1", description: "Desc1", numEmployees: 100, logoUrl: "http://c1.img" },
        { handle: "c2", name: "Company2", description: "Desc2", numEmployees: 200, logoUrl: "http://c2.img" },
        { handle: "c3", name: "Company3", description: "Desc3", numEmployees: 300, logoUrl: "http://c3.img" },
      ],
    });
  });

  test("works: by minEmployees", async () => {
    const resp = await request(app).get("/companies").query({ minEmployees: 200 });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      companies: [
        { handle: "c2", name: "Company2", description: "Desc2", numEmployees: 200, logoUrl: "http://c2.img" },
        { handle: "c3", name: "Company3", description: "Desc3", numEmployees: 300, logoUrl: "http://c3.img" },
      ],
    });
  });

  test("works: by maxEmployees", async () => {
    const resp = await request(app).get("/companies").query({ maxEmployees: 200 });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      companies: [
        { handle: "c1", name: "Company1", description: "Desc1", numEmployees: 100, logoUrl: "http://c1.img" },
        { handle: "c2", name: "Company2", description: "Desc2", numEmployees: 200, logoUrl: "http://c2.img" },
      ],
    });
  });

  test("works: by name", async () => {
    const resp = await request(app).get("/companies").query({ name: "2" });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      companies: [
        { handle: "c2", name: "Company2", description: "Desc2", numEmployees: 200, logoUrl: "http://c2.img" },
      ],
    });
  });

  test("works: by all filters", async () => {
    const resp = await request(app).get("/companies").query({ minEmployees: 100, maxEmployees: 300, name: "Company" });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      companies: [
        { handle: "c1", name: "Company1", description: "Desc1", numEmployees: 100, logoUrl: "http://c1.img" },
        { handle: "c2", name: "Company2", description: "Desc2", numEmployees: 200, logoUrl: "http://c2.img" },
        { handle: "c3", name: "Company3", description: "Desc3", numEmployees: 300, logoUrl: "http://c3.img" },
      ],
    });
  });

  test("fails: bad request on invalid filter", async () => {
    const resp = await request(app).get("/companies").query({ minEmployees: 200, maxEmployees: 100 });
    expect(resp.statusCode).toEqual(400);
  });
});