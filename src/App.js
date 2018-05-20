import React, { Component } from "react"
import Zones from "../build/contracts/Zones.json"
import getWeb3 from "./utils/getWeb3"

import "./css/oswald.css"
import "./css/open-sans.css"
import "./css/pure-min.css"
import "./App.css"

const colors = ["#ffee58", "#26a69a", "#ff7043", "#ec407a"]

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      selectedColorOption: 0,
      gridLoaded: false,
      zoneContractInstance: null,
      xInput: null,
      yInput: null,
      accounts: []
    }

    this.setColor = this.setColor.bind(this)
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })

        // Instantiate contract once web3 provided.
        this.instantiateContract()
      })
      .catch(() => {
        console.log("Error finding web3.")
      })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require("truffle-contract")
    const zones = contract(Zones)
    zones.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var zoneContractInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      console.log(accounts)

      zones.deployed().then(instance => {
        zoneContractInstance = instance

        console.log(zoneContractInstance)

        this.setState({ zoneContractInstance, accounts })
      })
    })
  }

  renderGrid(context, web3, colorValues) {
    console.log(context, colorValues)
    for (var i = 0; i < 50; i++) {
      for (var j = 0; j < 50; j++) {
        const colorIndex = colorValues[i][j].toNumber()
        context.fillStyle = colors[colorIndex]
        context.fillRect(i * 10, j * 10, 50, 50)
      }
    }
  }

  setColor(x, y, colorIndex) {
    console.log(x, y, colorIndex)
    this.state.zoneContractInstance
      .set(x, y, colorIndex, {
        from: this.state.accounts[0]
      })
      .then(response => {
        console.log(response)
        return this.state.zoneContractInstance.getAllColors.call()
      })
      .then(response => {
        this.renderGrid(this.canvasContext, this.state.web3, response)
      })
      .catch(err => {
        console.log(err)
      })
  }

  setSelectedColorOption(colorIndex) {
    console.log(colorIndex)
    this.setState({ selectedColorOption: colorIndex })
  }

  componentDidMount() {
    var canvas = document.getElementById("pixel-grid")
    if (canvas.getContext) {
      this.canvasContext = canvas.getContext("2d")
      canvas.addEventListener("click", event => {
        this.setState({
          xInput: Math.round(event.clientX / 10),
          yInput: Math.round(event.clientY / 10)
        })
      })
    }
  }

  addZone() {
    const connections = [12, 14, 5]
    const currentOwner = 0x0d1d4e623d10f9fba5db95830f7d3839406c6af2
    const id = prompt("enter a new id")
    // console.log(this.state.web3.getBalance(this.state.accounts[0]))
    this.state.zoneContractInstance
      .addZone(connections, currentOwner, id, {
        from: this.state.accounts[0],
        gas: 2721975
      })
      .then(response => {
        console.log(response)
      })
      .catch(err => {
        console.log(err)
      })
  }

  getBoardState() {
    this.state.zoneContractInstance.getZones
      .call()
      .then(response => {
        console.log(response)
      })
      .catch(err => {
        console.log(err)
      })
  }

  render() {
    return (
      <div className="App">
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              {!this.state.gridLoaded ? <p>Loading grid...</p> : null}
              <canvas id="pixel-grid" width="500" height="500" />
            </div>
            <button onClick={this.addZone.bind(this)}>Add Zone</button>
            <button onClick={this.getBoardState.bind(this)}>
              Get Board State
            </button>
          </div>
        </main>
      </div>
    )
  }
}

export default App
