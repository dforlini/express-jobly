const { BadRequestError } = require("../expressError");

/** Helper function for making selective update queries.
 *
 * The calling function can use it to create a SET clause and values array.
 *
 * - dataToUpdate: {Object} containing the fields to update and their new values
 * - jsToSql: {Object} maps JS-style data fields to database column names
 *
 * Returns:
 * { setCols, values }
 *  - setCols: string for the SET clause of the SQL query
 *  - values: array of the values for the placeholders in the SET clause
 * */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };




