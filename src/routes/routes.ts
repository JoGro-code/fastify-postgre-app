import { FastifyInstance } from "fastify";
import {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userControllerSql";

export default function (
  fastify: FastifyInstance,
  options: any,
  done: () => void
) {
  fastify.post("/users", createUser);
  fastify.get("/users", getUserById);
  fastify.put("/users", updateUser);
  fastify.delete("/users", deleteUser);

  done();
}
