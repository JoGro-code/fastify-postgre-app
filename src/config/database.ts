import { Sequelize } from "sequelize";
import dotenv from "dotenv";
//const dotenv = require("dotenv");

dotenv.config();

const assertVariable = (
  variable: string | undefined,
  variableName: string
): string => {
  if (variable === undefined) {
    throw new Error(`Umgebungsvariable ${variableName} ist nicht definiert.`);
  }
  return variable;
};

const DB_NAME = assertVariable(process.env.DB_NAME, "DB_NAME");
const DB_USER = assertVariable(process.env.DB_USER, "DB_USER");
const DB_PASSWORD = assertVariable(process.env.DB_PASSWORD, "DB_PASSWORD");
const DB_HOST = assertVariable(process.env.DB_HOST, "DB_HOST");
const DB_PORT = assertVariable(process.env.DB_PORT, "DB_PORT") || "5432";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: "postgres",
  logging: false,
  // Optional: Hinzufügen von dialectOptions wie zuvor diskutiert
});

export default sequelize;
