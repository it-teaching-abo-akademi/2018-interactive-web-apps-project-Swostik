import React from 'react';
import Portfolio from './Portfolio';
import './index.css';


class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      portList: [], //list of portfolios
      count: 0, //local counter that ensures unique portfolio keys
      value: '', //input text content
      show: false, //boolean to show or not the portfolio input name
    };
  }

  //handle portfolio input name
  handleChange(event) {
    this.setState({value: event.target.value});
  }

  //add a portfolio with n its name and i its ID, increment count state
  addPortFolio(n,i,b){
    if(b){ //add pf in localstorage if needed
      if (typeof localStorage["pf"] === 'undefined'){ //check if the pf localStorage already exists
        var a1 = []; //create new array of pf if it doesn't exist
      }else{
        a1 = JSON.parse(localStorage["pf"]); //get array of pf from the localStorage if it exists
      }
      var s = [] //stocks list
      var c = 0 //countP
      var p = {i,n,s,c}
      a1.push(p)
      localStorage["pf"] = JSON.stringify(a1);
      localStorage["c"] = this.state.count + 1
    }

    var newArray = this.state.portList
    newArray.push(<Portfolio id={i} name={n} onClick={() => this.delPortFolio(i)}/>)
    this.setState({portList:newArray})
    var ct = this.state.count
    const y = ct +1
    this.setState({count:y})
    this.setState({show:false})
  }


  //delete a portfolio thanks to its ID
  delPortFolio(i){
    //delete pf from the localstorage
    var pf = JSON.parse(localStorage["pf"])
    for (var t = 0; t < pf.length; t++) {
      if( pf[t].i === i){
        pf.splice(t,1)
      }
    }
    localStorage["pf"] = JSON.stringify(pf);


    var newArray = this.state.portList
    for (var j = 0; j < newArray.length; j++) {
      if(newArray[j].props.id === i){
        newArray.splice(j,1)
      }
    }
    this.setState({portList:newArray})
  }
  componentWillMount(){
    if(localStorage["c"]){
      var co = JSON.parse(localStorage["c"])
      this.setState({count:co})
    }
  }

  componentDidMount(){
    if(localStorage["pf"] && localStorage["c"]){
      var pf = JSON.parse(localStorage["pf"])

      for (var p in pf) {
        //add all already existing pf from the local storage
        this.addPortFolio(pf[p].n,pf[p].i,false)
      }
    }
  }


  render() {
    return (
      <div>
        {/* max number of portfolio is 10 */}
        {this.state.portList.length < 10 &&
        <button className="ui primary button" onClick={() => this.setState({show:true}) }>
        <i class="plus icon"></i>Add a Portfolio </button>}
        {/* input text only shown when adding a new portfolio*/}
        {this.state.show &&
          <div className="ui input">
            <input type="text" placeholder="Portfolio name" value={this.state.value} onChange={this.handleChange.bind(this)} />
            <button onClick={() => this.addPortFolio(this.state.value,this.state.count,true)}>Validate</button>
          </div>
        }
        {/* 4 rows of portfolios with unique keys*/}
        <div className="portfoliopanel">
          {this.state.portList.slice(0,2).map(portfolio => <div key={portfolio.props.id}> {portfolio} </div>)}
        </div>
        <br/><br/>
        <div className="portfoliopanel">
          {this.state.portList.slice(2,4).map(portfolio => <div key={portfolio.props.id}> {portfolio} </div>)}
        </div>
        <br/><br/>
        <div className="portfoliopanel">
          {this.state.portList.slice(4,6).map(portfolio => <div key={portfolio.props.id}> {portfolio} </div>)}
        </div>
        <br/><br/>
        <div className="portfoliopanel">
          {this.state.portList.slice(6,8).map(portfolio => <div key={portfolio.props.id}> {portfolio} </div>)}
        </div>
        <div className="portfoliopanel">
          {this.state.portList.slice(8,10).map(portfolio => <div key={portfolio.props.id}> {portfolio} </div>)}
        </div>
      </div>
    );
  }
}

export default Page;
