// user.service.js
import { pool } from "../database.js";

export default class UserService {
    async registeruser(user) {
        let regis = `INSERT INTO customer (CustomerName, CustomerLastname, CustomerPhone, CustomerMail, CustomerPW) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await pool.query(regis, [user.FirstName, user.LastName, user.Phone, user.Email, user.Password]);
        return result;  
    }

    async loginUser(email, password) {
      const query = `SELECT * FROM customer WHERE CustomerMail = ? AND CustomerPW = ?`;
        
        try {
          const [results] = await pool.query(query, [email, password]); // Use the pool for querying
          if (results.length > 0) {
            return results[0]; // Return the found user
          } else {
            return null; // No user found
          }
        } catch (error) {
          throw error; // Rethrow the error to handle it in the controller
        }
      }
    }

