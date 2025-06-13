require("dotenv").config();
const { Router } = require("express");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const zod = require("zod");
const bcrypt = require("bcrypt");
const { User } = require("../db/schema"); // Import the User model
const e = require("express");
const { parse } = require("dotenv");
const router = Router();

const signupSchema = zod.object({
  email: zod.string().email(),
  name: zod.string().min(3),
  password: zod.string(),
});
router.post("/signup", async (req, res) => {
  console.log(req.body);
  const { success, data } = signupSchema.safeParse(req.body);
  if (!success) {
    return res.json({ msg: "wrong input details" });
  }

  try {
    const hashedPassword = await bcrypt.hash(
      data.password,
      parseInt(process.env.HASH_SECRET)
    );

    // Define a default sessionData structure
    const defaultSession = new Map([
      ["firstSession", []], // Example session with an empty array of questions
    ]);

    const newUser = await User.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      sessionData: defaultSession, // Assign default sessionData here
    });

    const savedUser = await newUser.save();
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);

    return res.status(200).json({
      token,
      name: savedUser.name,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "user already exists or server error" });
  }
});

const signinSchema = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
  const { success, data } = signinSchema.safeParse(req.body);
  if (!success) {
    return res.status(500).json({ msg: "wrong inputs sent" });
  }

  try {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      const passwordValidation = await bcrypt.compare(
        data.password,
        existingUser.password
      );
      if (passwordValidation) {
        const token = jwt.sign(
          { id: existingUser._id },
          process.env.JWT_SECRET
        );
        return res.status(200).json({
          token,
          name: existingUser.name,
        });
      }
      return res.status(500).json({ msg: "wrong password sent" });
    }
    return res.status(500).json({ msg: "user not found" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "user not found" });
  }
});
const updatePassSchema = zod.object({
  email: zod.string().email(),
  password: zod.string(),
  new_password: zod.string(),
});

router.post("/changepass", async (req, res) => {
  const { success, data } = updatePassSchema.safeParse(req.body);
  if (!success) return res.status(500).json({ msg: "wrong details" });

  try {
    const existingUser = await User.findOne({ email: data.email });
    if (!existingUser) return res.status(404).json({ msg: "User not found" });
    // const oldPassword = await bcrypt.hash(data.password,parseInt(process.env.HASH_SECRET));
    const newHash = await bcrypt.hash(data.new_password,parseInt(process.env.HASH_SECRET));
    const isMatch = await bcrypt.compare(data.password,existingUser.password);
    if (!isMatch){
      return res.status(500).json({ mes: "enter correct old password" });
    }
    existingUser.password = newHash;
    console.log(existingUser)
    existingUser.save()
    res.json({ msg: "Updated passoword" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "something went wrong" });
  }
});
router.post("/isauthorized", authMiddleware, async (req, res) => {
  console.log("reached");
  return res.status(200).json({ message: "good to go" });
});

module.exports = router;
