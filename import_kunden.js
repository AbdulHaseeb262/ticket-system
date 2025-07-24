require('dotenv').config();
const { MongoClient } = require('mongodb');

const kunden = [
  { name: "Alber,Bernd,Dr.", ort: "Enns", telefon: "+43 7223 82 357", type: "Notariat" },
  { name: "Altenburger,Josef,Dr.", ort: "Leibnitz", telefon: "+43 3452 83100", type: "Notariat" },
  { name: "Bäck,Erfried,Dr.", ort: "Spittal/Drau", telefon: "+43 4762 5590 0", type: "Notariat" },
  { name: "Bajlicz,Walter,Dr.", ort: "Oberwart", telefon: "+43 3352 38 214", type: "Notariat" },
  { name: "Bauer,Peter,Mag.", ort: "Wien", telefon: "+43 1 317 10 40 0", type: "Notariat" },
  { name: "Baumgartner,Renate,Mag.", ort: "Wien", telefon: "+43 1 71070310" },
  { name: "Bencsics,Robert,Mag.", ort: "Oberwart", telefon: "+43 3352 32426" },
  { name: "Bonimaier,Christian,Dr.", ort: "Saalfelden", telefon: "+43 654273 398" },
  { name: "Brait,Martin,Dr.", ort: "Poysdorf", telefon: "+43 2552 2225" },
  { name: "Brunhölzl,Bernt,Mag.Dr.", ort: "Mödling", telefon: "+43 2236 23 147" },
  { name: "Coll,Hans,Dr.", ort: "Rottenmann", telefon: "+43 3614 2566" },
  { name: "Daxner,Matthias,Mag.Dr.,LL.B.", ort: "Mauthausen", telefon: "+43 7238 209 35" },
  { name: "Dohr,Friedrich,Dr.", ort: "Weiz", telefon: "+43 3172 44 0 44" },
  { name: "Falkner,Andreas,Dr.", ort: "Zell am Ziller", telefon: "+43 5282 22822" },
  { name: "Fellner,Gernot,Dr.", ort: "Linz", telefon: "+43 732 60 09 80" },
  { name: "Frizberg,Gerfried,Mag.", ort: "Birkfeld", telefon: "+43 3174 4408" },
  { name: "Frühwirth,Christian,Dr.", ort: "Bad Radkersburg", telefon: "+43 34762311" },
  { name: "Gratzl,Martin,Dr.,MBL", ort: "Ravelsbach", telefon: "+43 2958 82621" },
  { name: "Gravogl,Katharina,Mag.", ort: "Stegersbach", telefon: "+43 3326 54861" },
  { name: "Gruber,Philip,MMag.Dr.", ort: "Ottenschlag", telefon: "+43 2872 20333" },
  { name: "Hackl,Wolfgang,Dr.", ort: "Friedberg", telefon: "+43 3339 22 203" },
  { name: "Haider,Jochen,Mag.", ort: "Weiz", telefon: "+43 3172 44044" },
  { name: "Halbauer,Paulus,Mag.", ort: "Fürstenfeld", telefon: "+43 3382 51 651" },
  { name: "Halbritter,Karl Heinz,Dr.", ort: "Neusiedl/See", telefon: "+43 2167 81 80 0" },
  { name: "Handl,Marcella,Mag.", ort: "Hartberg", telefon: "+43 3332 65055" },
  { name: "Herk,Valentina,Mag.", ort: "Fehring", telefon: "+43 3155 5106" },
  { name: "Hochkofler,Ulrike,Mag.", ort: "Deutschlandsberg", telefon: "+43 3462 2492" },
  { name: "Holzer,Christian,Mag.Dr.,M.A.", ort: "Egg", telefon: "+43 5512 44335" },
  { name: "Holzinger,Gottfried,Mag.", ort: "Scheibbs", telefon: "+43 7482 44288" },
  { name: "Huber,Michael,Mag.", ort: "Voitsberg", telefon: "+43 3142 90900" },
  { name: "Jäger,Jörg,Mag.", ort: "Mariazell", telefon: "+43 3882 2411" },
  { name: "Kante,Christoph,Mag.,LL.M.", ort: "Lieboch", telefon: "+43 3136 62883" },
  { name: "Kaspar,Markus,Dr.", ort: "Wien", telefon: "+43 1 203 21 58" },
  { name: "Keppelmüller,Rudolf,MMag.Dr.", ort: "Eferding", telefon: "+43 7272 75 294" },
  { name: "Kinzer,Dieter,Dr.", ort: "Mürzzuschlag", telefon: "+43 3852 2647" },
  { name: "Klimscha,Christoph,Dr.", ort: "Scheibbs", telefon: "+43 7482 44 444" },
  { name: "Koller,Erwin,Dr.", ort: "Kufstein", telefon: "+43 5372 62300" },
  { name: "Kompein,Angelika,Mag.", ort: "Vösendorf", telefon: "+43 16999820" },
  { name: "Kriegleder,Rüdiger,Mag.,MBL", ort: "Linz", telefon: "+43732773777" },
  { name: "Kristl,Albert,Mag.,MBL", ort: "Gerasdorf", telefon: "+43 2246/52020" },
  { name: "Künzel,Christoph,Mag.", ort: "Vorau", telefon: "+43 3337 4114" },
  { name: "Leidenmühler,Kurt,Mag.", ort: "Haag am Hausruck", telefon: "+43 7732 3931 0" },
  { name: "Lenz,Wolfgang,Dr.", ort: "Linz", telefon: "+43 732 77 37 77" },
  { name: "Lohberger,Christoph,Mag.", ort: "Laßnitzhöhe", telefon: "+43 3133 33200" },
  { name: "Loidl,Josef,Mag.", ort: "Graz", telefon: "+43 316 8009" },
  { name: "Luger & Schöffl,Roland,Mag.,LLM,Paul,Mag.", ort: "Freistadt", telefon: "+43 7942 723 73" },
  { name: "Lunzer & Tempfer,Michael,Mag.,Julian,Mag.", ort: "Wien", telefon: "+43 1 407 77 77 0" },
  { name: "Lux,Martin,Mag.", ort: "Graz", telefon: "+43 316 8069" },
  { name: "Manninger,Heinz,Mag.", ort: "Eisenstadt", telefon: "+43 2682 75055" },
  { name: "Mifek,Manfred,Dr.", ort: "Wien", telefon: "+43 1 9824152" },
  { name: "Miklos,Alexander,Dr.", ort: "Wien", telefon: "+43 1 3261050" },
  { name: "Moser,Stephan,Mag.", ort: "Neumarkt", telefon: "+43 6216 5219" },
  { name: "Mrak,Otto,Mag.", ort: "St.Johann/Pongau", telefon: "+43 6412 4257" },
  { name: "NTBS", ort: "Wien", telefon: "+43 1 5356886-510" },
  { name: "Pauger & Pichler,Werner,Dr.,Arno,Dr.", ort: "Gleisdorf", telefon: "+43 3112 8383" },
  { name: "Pendl,Jürgen,Mag.", ort: "Leibnitz", telefon: "+43 3452 71334" },
  { name: "Pfeffer,Wolfgang,Mag.", ort: "Groß Enzersdorf", telefon: "+43 2249 20777" },
  { name: "Pfiszter,Richard,Dr.", ort: "Kalsdorf", telefon: "+43 3135 55 550" },
  { name: "Pichler,Sonja,Dr.", ort: "Graz", telefon: "+43 316 823415" },
  { name: "Platter,Oskar,Mag.", ort: "Landeck", telefon: "+43 5442 62 251" },
  { name: "Pouzar,Peter,Mag.", ort: "Baden", telefon: "+43 2252 209222" },
  { name: "Pouzar-Hofmeister,Isabella,Mag.", ort: "Wien", telefon: "+43 1 710 69 46" },
  { name: "Prägler,Hans Peter,Dr.,LLM", ort: "Wien", telefon: "+43 1 367 30 45" },
  { name: "Prandtstetten,Markus,Mag.", ort: "Wien", telefon: "+43 1 710 51 24" },
  { name: "Reich,Christian,MMag.Dr.", ort: "Raaba", telefon: "+43 316 909900" },
  { name: "Reisenberger,Klaus,Dr.", ort: "Silz", telefon: "+43 5263 6202" },
  { name: "Sauper & Übeleis,Isolde,Dr.,Siegfried,Dr.", ort: "St.Veit/Glan", telefon: "+43 4212 2183" },
  { name: "Schmölz,Clemens,Mag.", ort: "Feldkirch", telefon: "+43 5522 73121" },
  { name: "Schnabl,Wolfgang,Mag.", ort: "Stainz", telefon: "+43 3463 2329" },
  { name: "Schober-Hohla,Reinhild,Mag.", ort: "Gallneukirchen", telefon: "+43 7235 67067" },
  { name: "Schoiber,Christian,Dr.", ort: "Salzburg", telefon: "+43 662 88 77 66" },
  { name: "Schön,Erwin,Dr.", ort: "Mattsee", telefon: "+43 6217 570 40" },
  { name: "Schöniger-Hekele,Bernhard,Dr.", ort: "Wien", telefon: "+43 1 479 69 94 0" },
  { name: "Schreiber,Georg,Mag.", ort: "Wien", telefon: "+43 1 533 93 29" },
  { name: "Schwarz,Philipp,Dr.", ort: "Innsbruck", telefon: "+43 512 59 969 0" },
  { name: "Schweda,Patrick,Dr.", ort: "Haugsdorf", telefon: "+43 2944 2203" },
  { name: "Seyr-Recht,Christiane,Mag.", ort: "Korneuburg", telefon: "+43 2262 64260" },
  { name: "Spruzina & Zehetmayer,Claus,Dr.,Georg,Dr.", ort: "Hallein", telefon: "+43 6245 80 464" },
  { name: "Stein,Werner,Mag.", ort: "Klagenfurt am Wörthersee", telefon: "+43 463 50 533 0" },
  { name: "Steinhauser,Jürgen,Mag.", ort: "Weyer", telefon: "+43 7355 6235 12" },
  { name: "Steininger,Christian,Dr.", ort: "Matrei in Osttirol", telefon: "+43487593080" },
  { name: "Streicher,Teresa,Dr.", ort: "Lembach", telefon: "+43 7286 8235 0" },
  { name: "Taschner,Herbert,Mag.", ort: "Wiener Neustadt", telefon: "+43 2622 22 134" },
  { name: "Thier,Ursula,Mag.", ort: "Graz", telefon: "+43 316 816081" },
  { name: "Traar,Elvira,Mag.", ort: "Arnoldstein", telefon: "+43 4255 2443" },
  { name: "Traar,Markus,Mag.", ort: "Hermagor", telefon: "+43 4282 2182" },
  { name: "Umfahrer,Michael,Dr.", ort: "Wien", telefon: "+43 1 319 58 89 0" },
  { name: "Wagner,Michael,Mag.,Dr.,MBL", ort: "Wien", telefon: "+43 1 36 72 200" },
  { name: "Webersberger,Thomas,Mag.", ort: "Oberndorf", telefon: "+43 6272 40825" },
  { name: "Wiedermann,Clemens,Mmag.", ort: "Guttenstein", telefon: "+43 263472144" },
  { name: "Wittmann,Reinhard,Mag.", ort: "Wien", telefon: "+43 1 984 65 00" },
  { name: "Zankel,Bernd,Dr.", ort: "Wien", telefon: "+43 316 830283" },
  { name: "Zierhofer,Barbara,Mag.", ort: "Neunkirchen", telefon: "+43 2635 61860" },
  { name: "Zimmermann,Kurt,Dr.", ort: "Bregenz", telefon: "+43 5574 47 271", type: "Notariat" },
  { name: "sonstige Manzkunden", ort: "-", telefon: "-", type: "Notariat" }
];

async function main() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('customers');
    for (const k of kunden) {
      await collection.updateOne(
        { name: k.name, ort: k.ort },
        { $set: k },
        { upsert: true }
      );
    }
    console.log('Kunden importiert!');
  } finally {
    await client.close();
  }
}

main().catch(console.error); 