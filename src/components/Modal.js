import React from 'react';
import PropTypes from 'prop-types';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import './index.css';


class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stockname: null,
      data: [], //data to feed the graph
      minDateAvailable: null, //oldest date available
      maxDateAvailable: null, //newest date available
      firstDate: '', //first selected date
      secondDate: '', //second selected date
    };
  }

  //handle input first date
  handleChangeF(event) {
    this.setState({firstDate: event.target.value});
  }

  //handle input second date
  handleChangeS(event) {
    this.setState({secondDate: event.target.value});
  }

  //get daily data value of the stock
  getData() {
    this.setState({show:false})
    var client = new XMLHttpRequest();
    var that = this

    client.open("GET", "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + this.props.stockname + "&apikey=AABZ5Q20J049KTFZ", true);
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

        var date = [] //date array
        var res = []  //value array
        for (t in temp){
            const val = temp[t]["4. close"]
            res.push(val)
            date.push(t)
          count++
        }
        count =0
        that.buildData(res,date)
      };
    };
    client.send();
  }

  //build data to feed the graph
  //v:values array d:dates array
  buildData(v,d){
    var res = []
    this.setState({minDateAvailable:d[d.length-1]}) //last date of the dates array
    this.setState({maxDateAvailable:d[0]}) //first date of the dates array

    var f = d.length-1
    var s = 0

    if(this.state.firstDate !== null && this.state.secondDate !== null){ //if input date are correct
      for (var i = v.length-1; i >= 0; i--) {
        if(d[i] === this.state.firstDate){
          f = i //first date index
        }
        if(d[i] === this.state.secondDate){
          s = i //second date index
        }
      }
    }
    for (i = f; i >= s; i--) {
      //push (date,value) in res array
      res.push({name: d[i], [this.props.stockname]:parseFloat(v[i])})
    }

    this.setState({data:res})
  }

  componentDidMount(){
    this.getData()
  }

  render() {
    // Render nothing if the "show" prop is false
    if(!this.props.show) {
      return null;
    }

    // The gray background
    const backdropStyle = {
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: 50
    };

    // The modal "window"
    const modalStyle = {
      backgroundColor: '#fff',
      borderRadius: 5,
      maxWidth: 1500,
      minHeight: 600,
      margin: '0 auto',
      padding: 30
    };


    return (
      <div className="backdrop" style={backdropStyle}>
        <div className="modal" style={modalStyle}>

          <input type="date" name="bday" value={this.state.firstDate} onChange={this.handleChangeF.bind(this)} min={this.state.minDateAvailable} max={this.state.maxDateAvailable}/>
          <input type="date" name="bday" value={this.state.secondDate} onChange={this.handleChangeS.bind(this)} min={this.state.minDateAvailable} max={this.state.maxDateAvailable}/>

          <button onClick={() => this.getData()}> Plot </button>
          <br/>
          <br/>

          {/* LineChaart with custom properties
              XAxis : dates
              YAxis : values
           */}
          <LineChart width={1000} height={400} data={this.state.data}
                margin={{top: 5, right: 20, left: 20, bottom: 5}}>
            <XAxis dataKey="name"/>
            <YAxis/>
            <CartesianGrid strokeDasharray="3 3"/>
            <Tooltip/>
            <Legend />
            <Line type="monotone" dataKey={this.props.stockname} stroke="#8884d8" activeDot={{r: 8}}/>
          </LineChart>

          <div className="footer">
            <button className="cl" onClick={this.props.onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
};



export default Modal;
