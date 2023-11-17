const express = require("express");
const bcrypt = require("bcryptjs");
const Users = require("../users/users-model.js");
const { validatePayload } = require("./auth-middleware.js");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    const hash = bcrypt.hashSync(password, 8);
    // hashSync does the hashing synchronously,
    // meaning it will block any other code from running until it's done.
    const newUser = { username, password: hash };
    const result = await Users.add(newUser);
    res.status(201).json({
      message: `welcome ${result.username}!`,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const [user] = await Users.findBy({ username });
    if (user && bcrypt.compareSync(password, user.password)) {
      // if this is true, session is created
      req.session.user = user; // this is the session cookie
      res.status(200).json({
        message: `welcome ${user.username}!`,
      });
    } else {
      next({ status: 401, message: "Invalid username or password" });
    }
  } catch (err) {
    next(err);
  }
});

router.get("/logout", async (req, res, next) => {
  if (req.session.user) {
    const { username } = req.session.user;
    req.session.destroy(err => {
      if (err) {
        res.json({ message: `you can never leave ${username}!` });
      } else {
        res.set('Set-Cookie', 'ringofpower=; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
        res.json({message: `goodbye ${username}, come back soon!`});
      }
    })
  } else {
    res.json({message: "who that?"});
  }
});
module.exports = router;
