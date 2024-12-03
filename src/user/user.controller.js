// user.controller.js
import UserService from "./user.service.js";
import jwt from 'jsonwebtoken';
import config from "../config.js";

export const registeruser = async (req, res) => {
    const user = {
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Phone: req.body.Phone,
        Email: req.body.Email,
        Password: req.body.Password,
    };
    try {
        const result = await new UserService().registeruser(user);
        if (result.insertId) {
            return res.status(200).send({
                status: "success",
                code: 1,
                message: "User registered successfully",
                cause: "",
                result: {
                    Userid: result.insertId // Send Userid back to client
                },
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: "error",
            code: 0,
            message: error.message,
            cause: "",
            result: "",
        });
    }
}

export const login = async (req, res) => {
  const { Email, Password } = req.body;

  console.log('Attempting login with:', { Email, Password });

  try {
    const user = await new UserService().loginUser(Email.toLowerCase(), Password); // Use lowercase if that’s the column name
    console.log('User found:', user);

    if (user) {
      const token = jwt.sign(user, config.app.jwtkey, {
        expiresIn: "10h",
      });

      return res.status(200).json({
        status: "success",
        code: 1,
        message: "Login successful",
        user,
        token,
      });
    } else {
      return res.status(401).json({
        status: "fail",
        code: 0,
        message: "Unauthorized",
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};