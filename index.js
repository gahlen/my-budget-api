const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 4000;
const results = [];
const url =
  "mongodb+srv://admin-Fridley:_fjmhJ8MH-aTjm!@cluster0-bdcxo.mongodb.net/budget?retryWrites=true&w=majority";
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// This allows the use of app.body.
app.use(express.json());
app.use(cors());

app.get("/:key/:value", (req, res) => {
  client.connect(err => {
    const collection = client.db("budget").collection("bankData");
    // perform actions on the collection object
    const results = collection
      .find({ [req.params.key]: req.params.value })
      .toArray((err, docs) => {
        console.log(docs);
        res.send(docs);
      });

    client.close();
  });
});

app.get("/", (req, res) => {
  client.connect(err => {
    const collection = client.db("budget").collection("bankData");
    // perform actions on the collection object
    const results = collection.find({}).toArray((err, docs) => {
      console.log(docs);
      res.send(docs);
    });

    client.close();
  });
});

app.post("/", (req, res) => {
  client.connect(async err => {
    const collection = client.db("budget").collection("bankData");
    await bankResults();
    console.log("inserts", results);
    collection.insertMany(results);

    client.close();
  });
});

app.put("/:ID", (req, res) => {
  const body = req.body;
  client.connect(async err => {
    const collection = client.db("budget").collection("bankData");
    // perform actions on the collection object
    const results = await collection.updateOne(
      { _id: ObjectId(req.params.ID) },
      { $set: body }
    );
    res.send(results);

    client.close();
  });
});

app.delete("/:ID", (req, res) => {
  // res.send(`Deleted. ${req.params.ID}`);
  client.connect(async err => {
    const collection = client.db("budget").collection("bankData");
    // perform actions on the collection object
    const results = await collection.deleteOne({
      _id: ObjectId(req.params.ID)
    });
    res.send(results);

    client.close();
  });
});

const bankResults = () => {
  let complete = new Promise((resolve, reject) => {
    fs.createReadStream("../bankFile.csv", "utf8")
      .pipe(
        csv({
          mapHeaders: ({ header }) => {
            switch (header) {
              case "Effective Date":
                header = "effectiveDate";
                break;
              case "Transaction Type":
                header = "type";
                break;
              case "Reference Number":
                header = "refNumber";
                break;
              case "Description":
                header = "description";
                break;
                case "Transaction Category":
                header = "category";
                break;
              case "Amount":
                header = "amount";
                break;
              case "Balance":
                header = "balance";
                break;
              default:
                header = null;
            }
            return header;
          }
        })
      )
      .on("data", data => results.push(data))
      .on("end", () => {
        console.log("Import Successful");
        resolve(true);
      });
  });
  return complete;
};

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
