const express = require("express");
const cors = require("cors"); //cross origin resource sharing
const fs = require("fs");
const csv = require("csv-parser");
const MongoClient = require("mongodb").MongoClient;
require('dotenv').config()
                  

const app = express();
const port = process.env.PORT || 4000;
let results = [];
const url_local = process.env.REACT_APP_MONGOKEY_LOCAL
const url_remote = process.env.REACT_APP_MONGOKEY_REMOTE
const client = new MongoClient(url_local, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// This allows the use of app.body.
app.use(express.json());
app.use(cors());

// The "/ledger" is referred to as the restful endpoint.
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

// app.get("/ledger", async (req, res) => {  
//   await bankResults();
//   results.forEach(element => {
//     element.amount = parseFloat(element.amount)
//     element.balance = parseFloat(element.balance)
//   })
//   console.log(results)
//   res.send(results);  

//   });

app.get("/ledger", (req, res) => {
  client.connect(err => {
    const collection = client.db("budget").collection("bankData");
    collection.find({}).toArray((err, docs) => {
      res.send(docs);    
    });

    client.close();
  });
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
//:startDate/:endDate"
app.get("/summary/:startDate/:endDate", (req, res) => {
  client.connect(err => {
    const collection = client.db("budget").collection("budgetSummary");
    collection.find({"postDate":{"$gte": (req.params.startDate), "$lte": (req.params.endDate)}}).sort( { refNumber: -1 } ).toArray((err, docs) => {
  //collection.find({"postDate":{"$gte": ("2019-09-01"), "$lte": ("2019-09-06")}}).sort( { refNumber: -1 } ).toArray((err, docs) => {

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
        budget: parseFloat(doc.budgetAmount),
        carryover: parseFloat(doc.budgetBalance),
        amount: eval(doc.budget.reduce((acc, cur) => acc + parseFloat(cur.amount),0)).toFixed(2),
        difference: eval(parseFloat(doc.budgetAmount) + parseFloat(doc.budgetBalance) + doc.budget.reduce((acc, cur) => acc + parseFloat(cur.amount),0)).toFixed(2)
      }))
      res.send(results);
      console.log("results",results)
    });

    client.close();
  });
});


app.put("/category/:category/:amount/:balance", (req, res) => {
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
      data.postDate = new Date(data.postDate).toISOString()
      const {_id, ...updateData} = data //must destructure Id since we can't update it...
      const result = await collection.updateOne(
      { refNumber: data.refNumber },   //This format used since refNumber will be the key used for the put
      { $set: updateData },
      { upsert: true }
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
                header = "postDate";
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
