import React, { Component } from "react"
import Place from "../build/contracts/Place.json"
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
      placeContractInstance: null,
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
        console.log(results)
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
    const place = contract(Place)
    place.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var placeContractInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      console.log(accounts)

      place
        .deployed()
        .then(instance => {
          placeContractInstance = instance

          console.log(placeContractInstance)

          this.setState({ placeContractInstance, accounts })

          // Stores a given value, 5 by default.
          return placeContractInstance.getAllColors.call()
        })
        .then(result => {
          // Get the value from the contract to prove it worked.
          console.log(result)

          this.setState({
            gridLoaded: true
          })

          this.renderGrid(this.canvasContext, this.state.web3, result)
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
    this.state.placeContractInstance
      .set(x, y, colorIndex, {
        from: this.state.accounts[0]
      })
      .then(response => {
        console.log(response)
        return this.state.placeContractInstance.getAllColors.call()
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

  render() {
    return (
      <div className="App">
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              {!this.state.gridLoaded ? <p>Loading grid...</p> : null}
              <canvas id="pixel-grid" width="500" height="500" />
            </div>
            {colors.map((color, i) => (
              <div
                className="color-option"
                style={{
                  backgroundColor: color,
                  width: "100px",
                  height: "100px",
                  border:
                    i === this.state.selectedColorOption
                      ? "1px solid black"
                      : ""
                }}
                onClick={this.setSelectedColorOption.bind(this, i)}
              />
            ))}
            <input
              type="text"
              value={this.state.xInput}
              onChange={event => this.setState({ xInput: event.target.value })}
            />
            <input
              type="text"
              value={this.state.yInput}
              onChange={event => this.setState({ yInput: event.target.value })}
            />
            <button
              onClick={this.setColor.bind(
                this,
                this.state.xInput,
                this.state.yInput,
                this.state.selectedColorOption
              )}
            >
              Set Color
            </button>
          </div>
        </main>
      </div>
    )
  }
}

export default App
