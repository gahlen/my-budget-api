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