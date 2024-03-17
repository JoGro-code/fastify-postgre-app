// src/controllers/userController.ts
import { FastifyReply, FastifyRequest } from "fastify";
import User from "../models/user";

// Erstellen eines neuen Benutzers
export const createUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { name, email } = request.body as any; // Für Produktionscode Typsicherheit verbessern
  try {
    const user = await User.create({ name, email });
    reply.code(201).send(user);
  } catch (error) {
    reply.code(500).send(error);
  }
};

// Abrufen eines Benutzers anhand der ID
export const getUserById = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.query as any; // Für Produktionscode Typsicherheit verbessern
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return reply.code(404).send({ message: "Benutzer nicht gefunden" });
    }
    reply.send(user);
  } catch (error) {
    reply.code(500).send(error);
  }
};

// Aktualisieren eines Benutzers
export const updateUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.query as any; // Für Produktionscode Typsicherheit verbessern
  const updates = request.body as any;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return reply.code(404).send({ message: "Benutzer nicht gefunden" });
    }
    const updatedUser = await user.update(updates);
    reply.send(updatedUser);
  } catch (error) {
    reply.code(500).send(error);
  }
};

// Löschen eines Benutzers
export const deleteUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.query as any; // Für Produktionscode Typsicherheit verbessern
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return reply.code(404).send({ message: "Benutzer nicht gefunden" });
    }
    await user.destroy();
    reply.code(200).send({ message: "Benutzer gelöscht" });
  } catch (error) {
    reply.code(500).send(error);
  }
};
