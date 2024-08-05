"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * @param {Object} data - Company data { handle, name, description, numEmployees, logoUrl }
   *
   * @returns {object} - New company data { handle, name, description, numEmployees, logoUrl }
   *
   * @throws {BadRequestError} - if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companieswith optional filtering criteria
   *
   * @param {Object} [filters] - Optional search filters { name, minEmployees, maxEmployees }
   * @returns {Array} - list of companies [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll({ name, minEmployees, maxEmployees } = {}) {
    let query = `SELECT handle,
                        name,
                        description,
                        num_employees AS "numEmployees",
                        logo_url AS "logoUrl"
                 FROM companies`;
    let whereExpressions = [];
    let queryValues = [];

    // Add filter conditions to the query
    if (minEmployees !== undefined) {
      queryValues.push(minEmployees);
      whereExpressions.push(`num_employees >= $${queryValues.length}`);
    }

    if (maxEmployees !== undefined) {
      queryValues.push(maxEmployees);
      whereExpressions.push(`num_employees <= $${queryValues.length}`);
    }

    if (name) {
      queryValues.push(`%${name}%`);
      whereExpressions.push(`name ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    query += " ORDER BY name";
    const companiesRes = await db.query(query, queryValues);

    return companiesRes.rows;
  }
/**
   * Given a company handle, return data about the company.
   *
   * @param {string} handle - The handle of the company
   * @returns {Object} - The company data { handle, name, description, numEmployees, logoUrl, jobs }
   * @throws {NotFoundError} - If no company found with the given handle.
   */
static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
       FROM companies
       WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /**
   * Update company data with `data`.
   * This is a "partial update" 
   *
   * @param {string} handle - The handle of the company to update
   * @param {Object} data - The data to update { name, description, numEmployees, logoUrl }
   * @returns {Object} - The updated company data { handle, name, description, numEmployees, logoUrl }
   * @throws {NotFoundError} - If no company found with the given handle.
   */
  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /**
   * Delete given company from database; returns undefined.
   *
   * @param {string} handle - The handle of the company to delete
   * @throws {NotFoundError} - If no company found with the given handle.
   */
  static async remove(handle) {
    const result = await db.query(
      `DELETE
       FROM companies
       WHERE handle = $1
       RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

  

module.exports = Company;
