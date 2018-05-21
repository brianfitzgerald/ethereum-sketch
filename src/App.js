import React, { Component } from "react"
import Zones from "../build/contracts/Zones.json"
import getWeb3 from "./utils/getWeb3"

import "./css/oswald.css"
import "./css/open-sans.css"
import "./css/pure-min.css"
import "./App.css"

const colors = ["#ec407a", "#26a69a", "#ff7043", "#ffee58"]

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
      accounts: [],
      zones: [],
      connections: []
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

  dummyInit() {
    this.setState({
      gridLoaded: true,
      connections: [[5, 4], [3, 5], [3, 4], [3, 2]],
      zones: [
        {
          id: 5,
          currentOwner: "0x627306090abab3a6e1400e9345bc60c78a8bef57",
          x: 10,
          y: 15
        },
        {
          id: 4,
          currentOwner: "0x627306090abab3a6e1400e9345bc60c78a8bef57",
          x: 25,
          y: 15
        },
        {
          id: 3,
          currentOwner: "0x627306090abab3a6e1400e9345bc60c78a8bef57",
          x: 10,
          y: 35
        },
        {
          id: 2,
          currentOwner: "0x627306090abab3a6e1400e9345bc60c78a8bef57",
          x: 40,
          y: 35
        }
      ]
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

      zones
        .deployed()
        .then(instance => {
          zoneContractInstance = instance

          console.log(zoneContractInstance)

          this.setState({ zoneContractInstance, accounts })

          return zoneContractInstance.getZones.call()
        })
        .then(result => {
          console.log(result)

          this.setState({ gridLoaded: true, zones: result })

          // this.renderZones(this.canvasContext, this.state.web3, result)
        })
    })
  }

  renderZones(canvas, web3, zones, connections) {
    const RENDER_SCALE = 5
    console.log(canvas, web3, zones)
    var context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)
    for (var i = 0; i < zones.length; i++) {
      context.fillStyle = colors[i]
      context.fillRect(
        zones[i].x * RENDER_SCALE,
        zones[i].y * RENDER_SCALE,
        35,
        35
      )
    }
    for (let i = 0; i < connections.length; i++) {
      const startPoint = zones.find(z => z.id === connections[i][0])
      const endPoint = zones.find(z => z.id === connections[i][1])
      context.beginPath()
      context.moveTo(
        startPoint.x * RENDER_SCALE + 17,
        startPoint.y * RENDER_SCALE + 17
      )
      context.lineTo(
        endPoint.x * RENDER_SCALE + 17,
        endPoint.y * RENDER_SCALE + 17
      )
      context.stroke()
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
        // this.renderZones(this.canvasContext, this.state.web3, response)
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
    this.dummyInit()
    if (canvas.getContext) {
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
    if (this.state.gridLoaded) {
      console.log("render grid")
      this.renderZones(
        document.getElementById("pixel-grid"),
        this.state.web3,
        this.state.zones,
        this.state.connections
      )
    }
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
