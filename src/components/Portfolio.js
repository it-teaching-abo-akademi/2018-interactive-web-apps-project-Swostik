import React from 'react';
import Modal from './Modal';

class Portfolio extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id:null, //id of the portfolio
      name: null, //name
      total: 0, //total amount of money in the portfolio
      currency: "$", //current currency displayed
      stocklist: [], //list of stocks
      countP: 0, //local counter that ensures stock unique key
      pname: '', //input text for the input stock name
      pquantity: '', //input text for the input stock quantity
      show: false, //boolean to show or not the input stock name and quantity
      currencyValue: null, //current currency change from $ to €
    };
  }

  //https request to get the latest currency change
  getCurrencyValue(){
    var that = this
    var client = new XMLHttpRequest();
    client.open("GET", "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=AABZ5Q20J049KTFZ", true);
    client.onreadystatechange = function() {
      if(client.readyState === 4) {
        var obj = JSON.parse(client.responseText);
        var curr = obj["Realtime Currency Exchange Rate"]["5. Exchange Rate"]
        that.setState({currencyValue:curr})
      };
    };
    client.send();
  }

  //http request to add a stock thanks to its n:name/symbol.
  //get the current value in $ and calculate the total value thanks to its q:quantity
  add(n,q,a,b){
    this.setState({show:false})
    var that = this
    var array = a
    var client = new XMLHttpRequest();
    client.open("GET", "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + n +"&interval=1min&apikey=3ZO09J9XDN23K52H", true);
    client.onreadystatechange = function() {
      if(client.readyState === 4) {
        var obj = JSON.parse(client.responseText)
        var count = 0
        var t
        for (t in obj){
          if (count === 1) {
            var temp = obj[t]
          }
          count++
        }
        count = 0

        for (t in temp){
          if(count === 0){
            const val = temp[t]["4. close"]
            const tot = val * q
            that.addStock(n,q,val,tot,array)


            if(b){ //add the stock to the corresponding pf in the local storage
              var pf = JSON.parse(localStorage["pf"]);
              for( var p in pf){
                if(pf[p].i === that.props.id){
                  var ns = n
                  var qs = q
                  pf[p].s.push({ns,qs})
                }
              }
              localStorage["pf"] = JSON.stringify(pf);
            }


          }count++
        }
        count =0
      };
    };
    client.send();
  }

  //function that actually adds the stock to the stock list with all its attributes (n:name, q:quantity, v:value, t:totalvalue) and with an unique key
  addStock(n,q,v,t,a){
    var newArray = a
    if(this.state.currency === "€"){
      v = v * this.state.currencyValue
      t = v * q
    }
    var f = this.state.countP
    newArray.push(<Stock key={this.state.countP} idStock={this.state.countP} name={n} quantity={q} value={v} totalvalue={t} selected={false} onChange={() => this.selectStock(f)}/>)
    this.updateC()
    this.setState({stocklist:newArray}, function() {
      var c = this.state.countP
      const y = c +1
      this.setState({countP:y})
      this.getTotal()
    })
  }

  //funtion that add a stock to an array
  //a:array, c:key, n:name, q:quantity, v:value, t:totalvalue, s:selected, that:this
  //used in loops to avoid function in a loop warning
  addf(a,c,n,q,v,t,s,that){
    return function(){
      a.push(<Stock key={c} idStock={c} name={n} quantity={q} value={v} totalvalue={t} selected={s} onChange={() => that.selectStock(c)}/>)
    }
  }

  //function to select a stock in the stock list thanks to is idq:ID
  selectStock(idq){
    var func
    var newArray = this.state.stocklist
    var j
    for (var i = 0; i < this.state.stocklist.length; i++) {
      if(this.state.stocklist[i].props.idStock === idq){
        //if the stock is found, a new one with the same attributes except its selected attritute is added in the stock list
        func = this.addf(newArray,this.state.countP,this.state.stocklist[i].props.name,this.state.stocklist[i].props.quantity,this.state.stocklist[i].props.value,this.state.stocklist[i].props.totalvalue,!this.state.stocklist[i].props.selected,this)
        j=i
      }
    }
    func()//call the addf function after the loop
    newArray.splice(j,1)//delete the old stock
    this.setState({stocklist:newArray})
    var c = this.state.countP
    const y = c +1
    this.setState({countP:y})
    this.getTotal()
    var pf = JSON.parse(localStorage["pf"]); //get array of requests from the localStorage if it exists
    for( var m = 0; m < pf.length; m++){
      if(pf[m].i === this.props.id){
        pf[m].c++
      }
    }
    localStorage["pf"] = JSON.stringify(pf);
  }

  //handle stock input name
  handleChangeN(event) {
    this.setState({pname: event.target.value});
  }
  //handle stock input quantity
  handleChangeQ(event) {
    this.setState({pquantity: event.target.value});
  }

  //remove all selected stocks of the portfolio
  removeSelected(){
    var funcs =[] //array of function
    var newArray = [] //new stock list
    var counter = this.state.countP
    for (var i = 0; i < this.state.stocklist.length; i++) {
      if(!this.state.stocklist[i].props.selected){
        //each stock is pushed in a newArray if it is not selected
        funcs.push(this.addf(newArray,counter,this.state.stocklist[i].props.name,this.state.stocklist[i].props.quantity,this.state.stocklist[i].props.value,this.state.stocklist[i].props.totalvalue,this.state.stocklist[i].props.selected,this))
      }else{
        var pf = JSON.parse(localStorage["pf"]); //get array of pf from the localStorage if it exists
        for( var m = 0; m < pf.length; m++){
          if(pf[m].i === this.props.id){
            for(var t = 0; t < pf[m].s.length; t++){
              if(pf[m].s[t].ns === this.state.stocklist[i].props.name && pf[m].s[t].qs === this.state.stocklist[i].props.quantity){
                //delete selected stocks from the corresponding pf from the localstorage
                pf[m].s.splice(t,1)
              }
            }
          }
        }
        localStorage["pf"] = JSON.stringify(pf);
      }
      counter++
    }
    for (var j = 0; j < funcs.length; j++) {
      funcs[j]() //call all the addf calls of the previous loop
    }
    this.updateC()
    this.setState({stocklist:newArray},function(){
      this.setState({countP:counter})
      this.getTotal()
    })
  }

  //refresh the current currency change
  refresh(){
    this.getCurrencyValue()
    var newArray = []
    for (var i = 0; i < this.state.stocklist.length; i++) {
      //new request for each already existing stocks
      this.add(this.state.stocklist[i].props.name,this.state.stocklist[i].props.quantity,newArray,false)
    }
  }

  //update total amount of money in the portfolio by adding all stocks total values
  getTotal(){
    var res=0
    for (var i = 0; i < this.state.stocklist.length; i++) {
      res = res + this.state.stocklist[i].props.totalvalue
    }
    this.setState({total:res})
  }

  //change all stocks values and total values to euro, change current currency
  changeToEuro(){
    if(this.state.currency === "$"){
      this.setState({currency:"€"})
      var newArray = [] //new stocks list
      var funcs =[] //array of functions
      var counter = this.state.countP
      for (var i = 0; i < this.state.stocklist.length; i++) {
        var newV = this.state.stocklist[i].props.value * this.state.currencyValue //new value (calculated with currency change)
        var newTotal = newV * this.state.stocklist[i].props.quantity //newTotal value
        funcs.push(this.addf(newArray,counter,this.state.stocklist[i].props.name,this.state.stocklist[i].props.quantity,newV,newTotal,this.state.stocklist[i].props.selected,this))
        counter++
      }
      for (var t = 0; t < funcs.length; t++) {
        funcs[t]()
      }
      this.updateC()
      this.setState({stocklist:newArray},function(){
        this.setState({countP:counter})
        this.getTotal()
      })
    }
  }

  //change all stocks values and total values to dollar, change current currency
  changeToDollar(){
    if(this.state.currency === "€"){
      this.setState({currency:"$"})
      var newArray = []
      var funcs =[]
      var counter = this.state.countP
      for (var i = 0; i < this.state.stocklist.length; i++) {
        var newV = this.state.stocklist[i].props.value / this.state.currencyValue
        var newTotal = newV * this.state.stocklist[i].props.quantity
        funcs.push(this.addf(newArray,counter,this.state.stocklist[i].props.name,this.state.stocklist[i].props.quantity,newV,newTotal,this.state.stocklist[i].props.selected,this))
        counter++
      }
      for (var t = 0; t < funcs.length; t++) {
        funcs[t]()
      }
      this.updateC()
      this.setState({stocklist:newArray},function(){
        this.setState({countP:counter})
        this.getTotal()
      })
    }
  }

  updateC() { //update countP of the corresponding pf in the localStorage
    var pf = JSON.parse(localStorage["pf"]);
    for( var m = 0; m < pf.length; m++){
      if(pf[m].i === this.props.id){
        pf[m].c ++
      }
    }
    localStorage["pf"] = JSON.stringify(pf);
  }

  componentWillMount(){
    var pf = JSON.parse(localStorage["pf"]);
    for( var m = 0; m < pf.length; m++){
      if(pf[m].i === this.props.id){
        //set countP to the countP of the localstorage
        this.setState({countP:pf[m].c})
      }
    }
    localStorage["pf"] = JSON.stringify(pf);
  }

  componentDidMount(){
    this.getCurrencyValue() //get currency change when mounting

    var pf = JSON.parse(localStorage["pf"]); //get array of requests from the localStorage if it exists
    for( var m = 0; m < pf.length; m++){
      if(pf[m].i === this.props.id){
        for(var t = 0; t < pf[m].s.length; t++){
          //add all the stocks from the corresponding pf from the localstorage
          this.add(pf[m].s[t].ns,pf[m].s[t].qs,this.state.stocklist,false)
        }
      }
    }
    localStorage["pf"] = JSON.stringify(pf);
  }


  render() {
    return (
      <div className="ui fluid container portfolio">
        <div><h1>{this.props.name}</h1></div>

      {/* input text and quantity only shown when adding a new stock*/}
        {this.state.show &&
        <div >
          <input type="text" placeholder="Stock name" value={this.state.pname} onChange={this.handleChangeN.bind(this)} />
          <input type="text" placeholder="Quantity" value={this.state.pquantity} onChange={this.handleChangeQ.bind(this)} />
          <button onClick={() => this.add(this.state.pname,this.state.pquantity,this.state.stocklist,true)}>Validate</button>
        </div>
        }

        <button onClick={() => this.changeToEuro()}><i class="euro sign icon"></i></button>
        <button onClick={() => this.changeToDollar()}><i class="dollar sign icon"></i></button>
        <button onClick={() => this.refresh()}><i class="redo icon"></i></button>
        {/* button to delete the portfolio*/}
        <button className="bt" onClick={() => this.props.onClick(this.props.id)}><i class="window close icon"></i></button>
        {/* stock table */}
        <table width = "500">
          <thead>
            <tr>
              <th>Name</th>
              <th>Unit value</th>
              <th>Quantity</th>
              <th>Total value</th>
              <th>Select</th>
              <th>Graph</th>
            </tr>
          </thead>
          <tbody>
            {this.state.stocklist}
          </tbody>
        </table>
        <div>Total value of {this.props.name} : {this.state.total} {this.state.currency}</div>
        {this.state.stocklist.length < 50 &&
        <button onClick={() => this.setState({show:true})}>Add stock</button>}
        <button onClick={() => this.removeSelected()}>Remove selected</button>
      </div>
    );
  }
}

// Stock class with all its attributes
class Stock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      idStock:null,
      name: null,
      value: 0,
      quantity: 0,
      totalvalue: 0,
      selected: false,
      isOpen: false, //used to open a close the modal
    };
  }

  //open the modal
  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <tr >

        <td align= "center">{this.props.name}</td>
        <td align= "center">{this.props.value}</td>
        <td align= "center">{this.props.quantity}</td>
        <td align= "center">{this.props.totalvalue}</td>
        {/* checkbox to select and unselect this stock */}
        <td align= "center"><input type="checkbox" checked={this.props.selected} onChange={() => this.props.onChange(this.props.idStock)}/></td>
        <td align= "center"><button onClick={() => this.toggleModal()}>Show</button></td>
        {/* Modal component */}
        <Modal stockname={this.props.name} show={this.state.isOpen}
          onClose={this.toggleModal}>
        </Modal>
      </tr>

    );
  }
}

export default Portfolio;
