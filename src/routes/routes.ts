import { FastifyInstance } from "fastify";
import {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  addCustomerWithExternalID,
  getCustomerById,
  updateCustomerWithExternalID,
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

  fastify.get("/customer/getcustomerslistforfilter", getCustomerById); // Neue GET-Route für Kunden
  fastify.post(
    "/customer/addcustomerwithexternalid",
    addCustomerWithExternalID
  );
  fastify.post(
    "/customer/updatecustomerwithexternalid",
    updateCustomerWithExternalID
  );

  done();
}
