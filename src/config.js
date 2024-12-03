// config.js
const config = {
    app: {
      jwtkey: process.env.JWT_KEY,
    },
  
    db: {
      main: {
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
      },
      main2: {},
    },
  };
  
  export default config;