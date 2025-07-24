require('dotenv').config();
const { MongoClient } = require('mongodb');

const themen = [
  { name: "Neuinstallation/Konfiguration/Useranlage" },
  { name: "Vorlagen" },
  { name: "Kostenrechnen/OPV, Mahnwesen" },
  { name: "Cyberdoc Schnittstelle" },
  { name: "Cyberdoc Registrierungen" },
  { name: "Word" },
  { name: "Updates" },
  { name: "Beglaubigungen/Geschäftsregister" },
  { name: "Verlassenschaften/ Aktenverwaltung" },
  { name: "Sonstiges" },
  { name: "Notabene 6 webERV" },
  { name: "Notabene 6 Schnittstelle" },
  { name: "Anderkonto allgemein" },
  { name: "E/A Buchhaltung, Registrierkassa, Handkassa" },
  { name: "in Anderkonten Integral- / Elba-Schnittstelle" },
  { name: "FBA strukturiert" }
];

async function main() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('topics');
    for (const t of themen) {
      await collection.updateOne(
        { name: t.name },
        { $set: t },
        { upsert: true }
      );
    }
    console.log('Themen importiert!');
  } finally {
    await client.close();
  }
}

main().catch(console.error); 