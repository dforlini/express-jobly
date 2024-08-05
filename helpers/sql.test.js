// Import the required modules and functions
const { BadRequestError } = require("../src/expressError");
const { sqlForPartialUpdate } = require("../src/pathToFile");

// Describe the test suite for the sqlForPartialUpdate function
describe("sqlForPartialUpdate", () => {

  // Test case for a single field update
  test("works: single field", () => {
    // Data to be updated
    const dataToUpdate = { firstName: 'Aliya' };
    // Mapping of JS field names to SQL column names
    const jsToSql = { firstName: 'first_name' };

    // Call the function with the provided data
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    // Expect the result to match the expected SQL update statement and values
    expect(result).toEqual({
      setCols: '"first_name"=$1',
      values: ['Aliya']
    });
  });

  // Test case for multiple fields update
  test("works: multiple fields", () => {
    // Data to be updated
    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    // Mapping of JS field names to SQL column names
    const jsToSql = { firstName: 'first_name' };

    // Call the function with the provided data
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    // Expect the result to match the expected SQL update statement and values
    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ['Aliya', 32]
    });
  });

  // Test case when no JS to SQL mapping is provided
  test("works: no jsToSql mapping", () => {
    // Data to be updated
    const dataToUpdate = { age: 32 };
    // Empty mapping of JS field names to SQL column names
    const jsToSql = {};

    // Call the function with the provided data
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    // Expect the result to match the expected SQL update statement and values
    expect(result).toEqual({
      setCols: '"age"=$1',
      values: [32]
    });
  });

  // Test case when no data is provided for the update
  test("throws BadRequestError if no data", () => {
    // Expect the function to throw BadRequestError when called with empty data
    expect(() => {
      sqlForPartialUpdate({}, {});
    }).toThrow(BadRequestError);
  });

});