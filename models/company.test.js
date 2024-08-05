"use strict";

const db = require("../db");
const Company = require("./company");
// const { BadRequestError, NotFoundError } = require("../src/expressError");

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

describe("findAll", () => {
  test("works: no filter", async () => {
    let companies = await Company.findAll();
    expect(companies).toEqual([
      { handle: "c1", name: "Company1", description: "Desc1", numEmployees: 100, logoUrl: "http://c1.img" },
      { handle: "c2", name: "Company2", description: "Desc2", numEmployees: 200, logoUrl: "http://c2.img" },
      { handle: "c3", name: "Company3", description: "Desc3", numEmployees: 300, logoUrl: "http://c3.img" },
    ]);
  });

  test("works: by minEmployees", async () => {
    let companies = await Company.findAll({ minEmployees: 200 });
    expect(companies).toEqual([
      { handle: "c2", name: "Company2", description: "Desc2", numEmployees: 200, logoUrl: "http://c2.img" },
      { handle: "c3", name: "Company3", description: "Desc3", numEmployees: 300, logoUrl: "http://c3.img" },
    ]);
  });

  test("works: by maxEmployees", async () => {
    let companies = await Company.findAll({ maxEmployees: 200 });
    expect(companies).toEqual([
      { handle: "c1", name: "Company1", description: "Desc1", numEmployees: 100, logoUrl: "http://c1.img" },
      { handle: "c2", name: "Company2", description: "Desc2", numEmployees: 200, logoUrl: "http://c2.img" },
    ]);
  });

  test("works: by name", async () => {
    let companies = await Company.findAll({ name: "2" });
    expect(companies).toEqual([
      { handle: "c2", name: "Company2", description: "Desc2", numEmployees: 200, logoUrl: "http://c2.img" },
    ]);
  });

  test("works: by all filters", async () => {
    let companies = await Company.findAll({ minEmployees: 100, maxEmployees: 300, name: "Company" });
    expect(companies).toEqual([
      { handle: "c1", name: "Company1", description: "Desc1", numEmployees: 100, logoUrl: "http://c1.img" },
      { handle: "c2", name: "Company2", description: "Desc2", numEmployees: 200, logoUrl: "http://c2.img" },
      { handle: "c3", name: "Company3", description: "Desc3", numEmployees: 300, logoUrl: "http://c3.img" },
    ]);
  });
});