import { FastifyReply, FastifyRequest } from "fastify";
import sequelize from "../config/database";

export const getCustomerById = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.query as any;
  console.log("ID ", id);
  try {
    const customerQuery = `SELECT * FROM Customer WHERE ID = :id;`;
    const customerRes: any = await sequelize.query(customerQuery, {
      replacements: { id },
      type: "SELECT",
    });

    if (customerRes.length === 0) {
      return reply.code(404).send({ message: "Kunde nicht gefunden." });
    }

    const customer: any = customerRes[0];

    // Abrufen der WorkingHour-Daten
    const workingHoursQuery = `SELECT dayoftheweek, isworking ,morningfrom ,morninguntil ,afternoonfrom, afternoonuntil FROM WorkingHour WHERE CustomerID = :id;`;
    const workingHoursRes = await sequelize.query(workingHoursQuery, {
      replacements: { id },
      type: "SELECT",
    });

    // Abrufen der DynamicColumnsData-Daten
    const dynamicDataQuery = `SELECT customfieldsexternalid, fieldvalue FROM DynamicColumnsData WHERE CustomerID = :id;`;
    const dynamicDataRes = await sequelize.query(dynamicDataQuery, {
      replacements: { id },
      type: "SELECT",
    });

    // Zusammenstellen des finalen Objekts
    const finalObj = {
      ...customer,
      WorkingHour: workingHoursRes,
      DynamicColumnsData: dynamicDataRes,
    };

    reply.send(finalObj);
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: error }); //"Ein Fehler ist aufgetreten beim Abrufen des Kunden."
  }
};

// Hinzufügen eines neuen Kunden mit Details
export const addCustomerWithExternalID = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { body }: any = request;
  const transaction = await sequelize.transaction();

  try {
    // Hauptkundeninformationen einfügen
    const customer = await sequelize.query(
      `INSERT INTO Customer (ID, Name, Street, City, ZIPCode, CustomerNo, CountryName, Telephone, Email, IsActive, Company, X, Y, State, Qualification, Classification, Priority, Turnover, Telefax, Color, Size, Rhythm, Custom1, Custom2, Custom3, Custom4, Custom5, Custom6, Custom7, Custom8, Custom9, Custom10, PrefixTitleName, CustomerType)
       VALUES (:ID, :Name, :Street, :City, :ZIPCode, :CustomerNo, :CountryName, :Telephone, :Email, :IsActive, :Company, :X, :Y, :State, :Qualification, :Classification, :Priority, :Turnover, :Telefax, :Color, :Size, :Rhythm, :Custom1, :Custom2, :Custom3, :Custom4, :Custom5, :Custom6, :Custom7, :Custom8, :Custom9, :Custom10, :PrefixTitleName, :CustomerType)
       RETURNING *;`,
      {
        replacements: body,
        type: "INSERT",
        transaction,
      }
    );

    // Angenommen, die Struktur von body.WorkingHour und body.DynamicColumnsData stimmt mit der DB überein
    // WorkingHour-Daten für den Kunden einfügen
    for (const wh of body.WorkingHour) {
      await sequelize.query(
        `INSERT INTO WorkingHour (CustomerID, DayOfTheWeek, IsWorking, MorningFrom, MorningUntil, AfterNoonFrom, AfterNoonUntil)
         VALUES (:CustomerID, :DayOfTheWeek, :IsWorking, :MorningFrom, :MorningUntil, :AfterNoonFrom, :AfterNoonUntil);`,
        {
          replacements: { CustomerID: body.ID, ...wh },
          type: "INSERT",
          transaction,
        }
      );
    }

    // DynamicColumnsData-Daten für den Kunden einfügen
    for (const dcd of body.DynamicColumnsData) {
      await sequelize.query(
        `INSERT INTO DynamicColumnsData (CustomerID, CustomFieldsExternalID, FieldValue)
         VALUES (:CustomerID, :CustomFieldsExternalID, :FieldValue);`,
        {
          replacements: { CustomerID: body.ID, ...dcd },
          type: "INSERT",
          transaction,
        }
      );
    }

    await transaction.commit();
    reply.code(201).send(customer[0]);
  } catch (error) {
    await transaction.rollback();
    reply.code(500).send({
      error: error, // "Ein Fehler ist aufgetreten beim Hinzufügen des Kunden."
    });
  }
};

export const updateCustomerWithExternalID = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id }: any = request.query; // ID aus der Query
  const data: any = request.body;
  const transaction = await sequelize.transaction();

  try {
    // Schritt 1: Aktuelle Kundendaten abrufen
    const [currentCustomer] = await sequelize.query(
      `SELECT * FROM Customer WHERE ID = :id;`,
      { replacements: { id }, type: "SELECT", transaction }
    );

    if (!currentCustomer) {
      await transaction.rollback();
      return reply.code(404).send({ message: "Kunde nicht gefunden." });
    }

    // Schritt 2: Dynamische Erstellung des Update-Statements basierend auf Änderungen
    const updates = Object.keys(data).reduce((acc: any, key: any) => {
      if (data[key] !== currentCustomer[key]) {
        acc.push(`${key} = :${key}`);
      }
      return acc;
    }, []);

    if (updates.length > 0) {
      await sequelize.query(
        `UPDATE Customer SET ${updates.join(", ")} WHERE ID = :id RETURNING *;`,
        {
          replacements: { ...data, id },
          type: "UPDATE",
          transaction,
        }
      );
    }
    for (const wh of data.WorkingHour) {
      await sequelize.query(
        `UPDATE WorkingHour SET IsWorking = :IsWorking, MorningFrom = :MorningFrom, MorningUntil = :MorningUntil, AfterNoonFrom = :AfterNoonFrom, AfterNoonUntil = :AfterNoonUntil WHERE CustomerID = :CustomerID AND DayOfTheWeek = :DayOfTheWeek;`,
        { replacements: { ...wh, CustomerID: id }, type: "UPDATE", transaction }
      );
    }

    // Update-Logik für DynamicColumnsData
    for (const dcd of data.DynamicColumnsData) {
      await sequelize.query(
        `UPDATE DynamicColumnsData SET FieldValue = :FieldValue WHERE CustomerID = :CustomerID AND CustomFieldsExternalID = :CustomFieldsExternalID;`,
        {
          replacements: { ...dcd, CustomerID: id },
          type: "sequelize.QueryTypes.",
          transaction,
        }
      );
    }

    // Ähnliche Logik für WorkingHour und DynamicColumnsData
    // Hier muss spezifische Logik implementiert werden, die von den Datenmodellen abhängt

    await transaction.commit();
    reply.code(200).send({ message: "Kunde erfolgreich aktualisiert." });
  } catch (error) {
    await transaction.rollback();
    reply.code(500).send({
      error: "Ein Fehler ist aufgetreten beim Aktualisieren des Kunden.",
    });
  }
};
