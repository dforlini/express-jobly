"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const { BadRequestError, UnauthorizedError } = require("../expressError");

const router = express.Router();

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */
router.post("/auth/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */
router.post("/auth/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({ ...req.body, isAdmin: false });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

/** GET /users => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/
router.get("/users", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /users/:username => { user }
 *
 * Returns { username, firstName, lastName, isAdmin, jobs }
 *   where jobs is [ jobId, jobId, ... ]
 *
 * Authorization required: admin or same-user-as-:username
 **/
router.get("/users/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    if (req.params.username !== res.locals.user.username && !res.locals.user.isAdmin) {
      throw new UnauthorizedError();
    }

    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /users/:username { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email, isAdmin }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/
router.patch("/users/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    if (req.params.username !== res.locals.user.username && !res.locals.user.isAdmin) {
      throw new UnauthorizedError();
    }

    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /users/:username => { deleted: username }
 *
 * Authorization required: admin or same-user-as-:username
 **/
router.delete("/users/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    if (req.params.username !== res.locals.user.username && !res.locals.user.isAdmin) {
      throw new UnauthorizedError();
    }

    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});

/** POST /users/:username/jobs/:id => { applied: jobId }
 *
 * Allows a user to apply for a job.
 *
 * Returns { applied: jobId }
 *
 * Authorization required: admin or same-user-as-:username
 * */
router.post("/users/:username/jobs/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    if (req.params.username !== res.locals.user.username && !res.locals.user.isAdmin) {
      throw new UnauthorizedError();
    }

    await User.applyToJob(req.params.username, req.params.id);
    return res.json({ applied: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;