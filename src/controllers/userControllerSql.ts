import { FastifyReply, FastifyRequest } from "fastify";
import sequelize from "../config/database";

// Erstellen eines neuen Benutzers
export const createUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { name, email } = request.body as any; // Für Produktionscode Typsicherheit verbessern
  try {
    const [result] = await sequelize.query(
      `INSERT INTO users (name, email) VALUES (:name, :email) RETURNING *;`,
      {
        replacements: { name, email },
        type: "INSERT",
      }
    );
    reply.code(201).send(result);
  } catch (error) {
    reply.code(500).send(error);
  }
};

// Abrufen eines Benutzers anhand der ID
export const getUserById = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.query as any;
  try {
    const [result] = await sequelize.query(
      `SELECT * FROM users WHERE id = :id;`,
      {
        replacements: { id },
        type: "SELECT",
      }
    );
    if (result.length === 0) {
      return reply.code(404).send({ message: "Benutzer nicht gefunden" });
    }
    reply.send(result);
  } catch (error) {
    reply.code(500).send(error);
  }
};

// Aktualisieren eines Benutzers
export const updateUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.query as any;
  const updates = request.body as any; // Hier müsstest du die Updates spezifizieren
  try {
    await sequelize.query(
      `UPDATE users SET name = :name, email = :email WHERE id = :id RETURNING *;`,
      {
        replacements: { ...updates, id },
        type: "UPDATE",
      }
    );
    reply.code(200).send({ message: "Benutzer aktualisiert" });
  } catch (error) {
    reply.code(500).send(error);
  }
};

// Löschen eines Benutzers
export const deleteUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.query as any;
  try {
    await sequelize.query(`DELETE FROM users WHERE id = :id;`, {
      replacements: { id },
      type: "DELETE",
    });
    reply.code(200).send({ message: "Benutzer gelöscht" });
  } catch (error) {
    reply.code(500).send(error);
  }
};
