putArray.push(Object.entries(element)); //parse object key value pairs into an array


const loadPutArray = (body,reference) => {
    console.log("body and reference", body, reference,reference.length)
    for(i = 0; i < reference.length; i++) {
      console.log("reference",reference,i, reference.length)
      body.forEach(bodyElement => {
        if (reference[i] === bodyElement.refNumber) {
          console.log("found element", element, bodyElement)
        }
      })
    };
    return putResults;
  }
  // filter/includes example
  let putData = this.state.entryData.filter(data => 
    reference.includes(data.refNumber))


    .then(this.state.entryData.forEach(element => {
        this.setState.budgetTotal += parseFloat(element.budgetAmount)
        console.log("budget Total",this.this.state.budgetTotal)
      })) 



      {/* <BootstrapTable
          keyField="_id"
          data={this.props.entryData}
          columns={columns}
        /> */}
//code for destructuring and removing a field in an array of objects 
docs.map((doc) =>{
    let {_id,...result}=doc
    return result
  })

  //Create view in the mongo shell(enter mongo in editor to enter mongo shell)
  db.createView(
    "budgetDetails",
    "budgetCategories",
    [
      { $lookup: { from: "bankData", localField: "category", foreignField: "category", as: "budget" } },
      { $project: { "budget.type": 0, "budget._id": 0, "budget.description": 0, "budget.balance": 0 } }
    ]
 )