import fastify, { FastifyServerOptions } from "fastify";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { apiKeyAuth } from "./middlewares/apiKeyAuth";
import sequelize from "./config/database";
import routes from "./routes/routes";
import cors from "@fastify/cors";
import yaml from "js-yaml";
//import { OpenAPIV3 } from "openapi-types";
//import swagger from "@fastify/swagger";
//import swaggerUI from "@fastify/swagger-ui";
import corsOptions from "./config/corsOptions";

dotenv.config();

let serverOptions: Partial<any> = {};
try {
  const keyPath = path.join(__dirname, "..", process.env.SSL_KEY_PATH || "");
  const certPath = path.join(__dirname, "..", process.env.SSL_CERT_PATH || "");
  serverOptions.https = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
} catch (error) {
  console.warn(
    "SSL-Zertifikat oder Schlüssel nicht gefunden, starte als HTTP-Server."
  );
}

const server = fastify({
  logger: true,
  ...serverOptions,
});

// Pfad zur YAML-Datei
const yamlPath = path.join(__dirname, "../docs/swagger.yaml");

// Lese und parse die YAML-Datei
const swaggerSpec = yaml.load(fs.readFileSync(yamlPath, "utf8"));
// Lese und parse die YAML-Datei
//const swaggerSpec = yaml.load(
//  fs.readFileSync(yamlPath, "utf8")
//) as OpenAPIV3.Document;

server.register(cors, corsOptions);

server.register(require("@fastify/swagger"), {
  routePrefix: "/docs",
  swagger: swaggerSpec,
  exposeRoute: true,
});

server.addHook("preHandler", apiKeyAuth);
server.register(routes);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Datenbankverbindung erfolgreich hergestellt.");

    const PORT = process.env.SERVER_PORT || "3000";
    await server.listen({ port: parseInt(PORT, 10), host: "0.0.0.0" });
    const protocol = serverOptions.https ? "https" : "http";
    console.log(`Server läuft auf ${protocol}://localhost:${PORT}`);
  } catch (err) {
    console.error("Fehler beim Starten der Anwendung:", err);
    process.exit(1);
  }
};

start();
