import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";
import { jwtConfig } from "../config/auth.config.js";

const prisma = db.prisma;

export const signup = async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 8);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        roles: roles && roles.length > 0
          ? { connect: roles.map(role => ({ name: role })) }
          : { connect: [{ name: "user" }] },
      },
      include: {roles: true}
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      jwtConfig.secret,
      { expiresIn: '30d', algorithm: 'HS256', allowInsecureKeySizes: true }
    );

    const authorities = user.roles.map(role => `ROLE_${role.name.toUpperCase()}`);


    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax", 
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
      include: { roles: true }
    });

    if (!user) return res.status(404).send({ message: "User not found." });

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.status(401).send({ message: "Invalid Password!" });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      jwtConfig.secret,
      { expiresIn: '30d', algorithm: 'HS256', allowInsecureKeySizes: true }
    );


    const authorities = user.roles.map(role => `ROLE_${role.name.toUpperCase()}`);

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "Lax", 
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities
    });

  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const signout = (req, res) => {
  res.clearCookie("accessToken");
  res.status(200).send({ message: "You've been signed out!" });
};
