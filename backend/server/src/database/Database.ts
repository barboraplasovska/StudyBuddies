import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  database: process.env.SQL_DATABASE,
  username: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  host: process.env.SQL_HOST,
  dialect: "mariadb",
  pool: {
    max: 30,
  },
  define: {
    timestamps: false,
    freezeTableName: true,
  },
});

export { sequelize };
