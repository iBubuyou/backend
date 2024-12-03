// user.router.js
import { Router } from "express";
import * as usercontroller from "./user.controller.js"

const router=Router();


router.post("/register",usercontroller.registeruser);
router.post("/login",usercontroller.login);

export default router;