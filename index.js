const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 4000;
let results = [];
const url = "mongodb://localhost:27017"
// const url =
//   "mongodb+srv://admin-Fridley:_fjmhJ8MH-aTjm!@cluster0-bdcxo.mongodb.net/budget?retryWrites=true&w=majority";
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// This allows the use of app.body.
app.use(express.json());
app.use(cors());

app.post("/ledger", (req, res) => {
  client.connect(async err => {
    const collection = client.db("budget").collection("bankData");
    await bankResults();
    results.forEach(element => {
      element.amount = parseFloat(element.amount)
      element.balance = parseFloat(element.balance)
    })
    collection.insertMany(results);
    res.send(results);

    client.close();
  });
});

app.post("/category", (req, res) => {
  const body =  req.body;
  console.log("reqbody", body)
  client.connect(async err => {
    const collection = client.db("budget").collection("budgetCategories");
    const results = await collection.insertMany(body);
    res.send(results);

    client.close();
  });
});

app.get("/:key/:value", (req, res) => {
  client.connect(err => {
    const collection = client.db("budget").collection("budgetSummary");
    collection.find({ [req.params.key]: req.params.value })
      .toArray((err, docs) => {
        res.send(docs);
      });

    client.close();
  });
});

app.get("/ledger", async (req, res) => {  
  await bankResults();
  results.forEach(element => {
    element.amount = parseFloat(element.amount)
    element.balance = parseFloat(element.balance)
  })
  console.log(results)
  res.send(results);  


  });

app.get("/category", (req, res) => {
  client.connect(err => {
    const collection = client.db("budget").collection("budgetCategories");
    collection.find({}).toArray((err, docs) => {
      res.send(docs);    
    });

    client.close();
  });
});

app.get("/summary", (req, res) => {
  client.connect(err => {
    const collection = client.db("budget").collection("budgetSummary");
    collection.find({}).toArray((err, docs) => {
      res.send(docs);    
    });

    client.close();
  });
});

app.get("/budget", (req, res) => {
  client.connect(err => {
    const db = client.db("budget")
    const collection = client.db("budget").collection("budgetDetails");
    collection.find({}).toArray((err, docs) => {
      let results = docs.map(doc => ({
        category: doc.category,
        budget: doc.budgetAmount,
        carryover: doc.budgetBalance,
        amount: doc.budget.reduce((acc, cur) => acc + cur.amount,0),
        difference: eval(doc.budgetAmount + doc.budget.reduce((acc, cur) => acc + cur.amount,0)).toFixed(2)
      }))
      console.log("budget details",results)
      res.send(results);
    });

    client.close();
  });
});


app.put("/category/:category/:amount/:balance", (req, res) => {
  const body = req.body;
  client.connect(async err => {
    const collection = client.db("budget").collection("budgetCategories");
    // perform actions on the collection object
    const results = await collection.updateOne(
      { category: req.params.category },
      { $set: { budgetAmount: req.params.amount, budgetBalance: req.params.balance } },
      { upsert: true}
    );
    res.send(results);

    client.close();
  });
});

app.put("/summary", (req, res) => {
  client.connect(async err => {
    const collection = client.db("budget").collection("budgetSummary");
      const results = await req.body.map(async data => {
      const {_id, ...updateData} = data //must destructure Id since we can't update it...
      console.log("data",data)
      const result = await collection.updateOne(
      { refNumber: data.refNumber },
      { $set: updateData },
      { upsert: true}
      );
      return result;
    });
    res.send(results);

    client.close();
  });
});

app.delete("/category/:category", (req, res) => {
  // res.send(`Deleted. ${req.params.ID}`);
  client.connect(async err => {
    const collection = client.db("budget").collection("budgetCategories");
    const results = await collection.deleteOne({
      category: req.params.category
    });
    res.send(results);

    client.close();
  });
});

const bankResults = () => {
  results = []
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
