import { FastifyReply, FastifyRequest } from "fastify";
import sequelize from "../config/database";
import { WorkingHour } from "../types/index";

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
  const newData: any = request.body;
  const transaction = await sequelize.transaction();

  try {
    // Schritt 1: Aktuelle Kundendaten zusammen mit assoziierten Daten abrufen
    const currentCustomerData: any = await sequelize.query(
      `
      SELECT c.*, json_agg(distinct w.*) as WorkingHours, json_agg(distinct d.*) as DynamicData
      FROM Customer c
      LEFT JOIN WorkingHour w ON w.CustomerID = c.ID
      LEFT JOIN DynamicColumnsData d ON d.CustomerID = c.ID
      WHERE c.ID = :id
      GROUP BY c.ID;
    `,
      {
        replacements: { id },
        type: "SELECT",
        transaction,
      }
    );

    if (!currentCustomerData || currentCustomerData.length === 0) {
      await transaction.rollback();
      return reply.code(404).send({ message: "Kunde nicht gefunden." });
    }

    // Schritt 2: Vergleichen der übergebenen Daten mit den aktuellen Daten und Aktualisieren bei festgestellten Unterschieden
    let updates: any = [];
    Object.keys(newData).forEach((key) => {
      // Ignoriere verschachtelte Objekte wie WorkingHours und DynamicColumnsData hier
      if (
        key !== "WorkingHour" &&
        key !== "DynamicColumnsData" &&
        newData[key] !== currentCustomerData[key]
      ) {
        updates.push(`${key} = :${key}`);
      }
    });
    console.log("Updates:", updates);
    if (updates.length > 0) {
      await sequelize.query(
        `UPDATE Customer SET ${updates.join(", ")} WHERE ID = :id RETURNING *;`,
        {
          replacements: { ...newData, id }, // Verwende newData anstelle von data
          type: "UPDATE",
          transaction,
        }
      );
    }
    // Schritt 3: WorkingHour-Daten aktualisieren
    for (const wh of newData.WorkingHour || []) {
      const [existingWh] = await sequelize.query(
        `SELECT * FROM WorkingHour WHERE CustomerID = :CustomerID AND DayOfTheWeek = :DayOfTheWeek;`,
        {
          replacements: { CustomerID: id, DayOfTheWeek: wh.DayOfTheWeek },
          type: "SELECT",
          transaction,
        }
      );
      if (existingWh) {
        // Update, wenn Eintrag existiert
        await sequelize.query(
          `UPDATE WorkingHour
           SET IsWorking = :IsWorking, MorningFrom = :MorningFrom, MorningUntil = :MorningUntil, AfterNoonFrom = :AfterNoonFrom, AfterNoonUntil = :AfterNoonUntil
           WHERE CustomerID = :CustomerID AND DayOfTheWeek = :DayOfTheWeek;`,
          {
            replacements: {
              ...wh,
              CustomerID: id,
            },
            type: "UPDATE",
            transaction,
          }
        );
      } else {
        // Insert, wenn kein Eintrag existiert
        await sequelize.query(
          `INSERT INTO WorkingHour (CustomerID, DayOfTheWeek, IsWorking, MorningFrom, MorningUntil, AfterNoonFrom, AfterNoonUntil)
           VALUES (:CustomerID, :DayOfTheWeek, :IsWorking, :MorningFrom, :MorningUntil, :AfterNoonFrom, :AfterNoonUntil);`,
          {
            replacements: {
              ...wh,
              CustomerID: id,
            },
            type: "INSERT",
            transaction,
          }
        );
      }
    }

    /// Schritt 4: DynamicColumnsData aktualisieren
    for (const dcd of newData.DynamicColumnsData || []) {
      const [existingDcd] = await sequelize.query(
        `SELECT * FROM DynamicColumnsData WHERE CustomerID = :CustomerID AND CustomFieldsExternalID = :CustomFieldsExternalID;`,
        {
          replacements: {
            CustomerID: id,
            CustomFieldsExternalID: dcd.CustomFieldsExternalID,
          },
          type: "SELECT",
          transaction,
        }
      );

      if (existingDcd) {
        // Update, wenn Eintrag existiert
        await sequelize.query(
          `UPDATE DynamicColumnsData
           SET FieldValue = :FieldValue
           WHERE CustomerID = :CustomerID AND CustomFieldsExternalID = :CustomFieldsExternalID;`,
          {
            replacements: {
              ...dcd,
              CustomerID: id,
            },
            type: "UPDATE",
            transaction,
          }
        );
      } else {
        // Insert, wenn kein Eintrag existiert
        await sequelize.query(
          `INSERT INTO DynamicColumnsData (CustomerID, CustomFieldsExternalID, FieldValue)
           VALUES (:CustomerID, :CustomFieldsExternalID, :FieldValue);`,
          {
            replacements: {
              ...dcd,
              CustomerID: id,
            },
            type: "INSERT",
            transaction,
          }
        );
      }
    }

    await transaction.commit();
    reply.code(200).send({ message: "Kunde erfolgreich aktualisiert." });
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    reply.code(500).send({
      error: error, //"Ein Fehler ist aufgetreten beim Aktualisieren des Kunden."
    });
  }
};
