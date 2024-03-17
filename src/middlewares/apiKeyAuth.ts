import dotenv from "dotenv";
import { FastifyReply, FastifyRequest } from "fastify";

dotenv.config();

/**
 * API-Key Authentication Middleware.
 *
 * Diese Middleware überprüft den API-Key, der in den Anfrage-Headern gesendet wurde.
 * Ein gültiger API-Key ist erforderlich, um Zugriff auf geschützte Routen zu erhalten.
 *
 * @param {FastifyRequest} request - Das Request-Objekt.
 * @param {FastifyReply} reply - Das Reply-Objekt.
 * @param {Function} done - Die Callback-Funktion, die die Verarbeitung der Anfrage fortsetzt.
 */
export const apiKeyAuth = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: Function
) => {
  const expectedApiKey = process.env.API_KEY; // Der erwartete API-Key aus der Umgebungsvariable
  const apiKey = request.headers["api-key"];

  if (!apiKey || apiKey !== expectedApiKey) {
    reply.code(401).send({ message: "Ungültiger oder fehlender API-Key" });
    return;
  }

  done();
};
