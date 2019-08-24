const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 4000;
const results = [];
const putResults = [];
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
      res.send(docs);
    });

    client.close();
  });
});

app.get("/category", (req, res) => {
  client.connect(err => {
    const collection = client.db("budget").collection("budgetCategories");
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
    res.send(results);

    client.close();
  });
});


app.post("/category", (req, res) => {
  const body = [req.body];
  console.log("post budget",req.body)
  client.connect(async err => {
    const collection = client.db("budget").collection("budgetCategories");
    const results = await collection.insertMany(body);
    console.log("inserts", results);
    res.send(results)

    client.close();
  });
});


 const body = [req.body];
  loadPutArray(body);
  console.log("put results",putResults)

  // client.connect(async err => {
  //   const collection = client.db("budget").collection("bankData");
  //   // perform actions on the collection object
  //   const results = await collection.updateOne(
  //     { refNumber: req.params.refNumber },
  //     { $set: { budgetAmount: req.params.amount }}
  //   );
  //   res.send(results);

  //   client.close();
  //});
});app.put("/budget", (req, res) => {
 

app.delete("/category/:category", (req, res) => {
  // res.send(`Deleted. ${req.params.ID}`);
  client.connect(async err => {
    const collection = client.db("budget").collection("budgetCategories");
    // perform actions on the collection object
    const results = await collection.deleteOne({
      category: req.params.category
    });
    res.send(results);

    client.close();
  });
});

const loadPutArray = (body) => {
  const putArray = []
  console.log("api body", body)
  body.forEach(element => {
    putArray.push(Object.entries(element));
    console.log("putArray",putArray)
  });
  return putResults;
}

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
