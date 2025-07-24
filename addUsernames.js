const { MongoClient } = require('mongodb');
require('dotenv').config();

(async () => {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db();
  const updates = [
    { email: 'ana.balic@notabene.at', username: 'Ana.Balic' },
    { email: 'angelika.wessely@notabene.at', username: 'Angelika.Wessely' },
    { email: 'michael.wessely@notabene.at', username: 'Michael.Wessely' },
    { email: 'mikheil.tamasidze@notabene.at', username: 'Mikheil.Tamasidze' },
    { email: 'fatma.guengoer@notabene.at', username: 'Fatma.Guentgoer' },
    { email: 'laura.schmitzberger@notabene.at', username: 'Laura.Schmitzberger' },
    { email: 'peter.pflanzl@notabene.at', username: 'Peter.Pflanzl' }
  ];
  for (const u of updates) {
    await db.collection('users').updateOne({ email: u.email }, { $set: { username: u.username } });
  }
  console.log('Usernamen hinzugefügt!');
  client.close();
})(); 