import React, { Component } from "react"
import SimpleStorageContract from "../build/contracts/SimpleStorage.json"
import getWeb3 from "./utils/getWeb3"

import "./css/oswald.css"
import "./css/open-sans.css"
import "./css/pure-min.css"
import "./App.css"

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null
    }
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
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      console.log(accounts)

      simpleStorage
        .deployed()
        .then(instance => {
          simpleStorageInstance = instance

          // Stores a given value, 5 by default.
          return simpleStorageInstance.set(4, { from: accounts[0] })
        })
        .then(result => {
          // Get the value from the contract to prove it worked.
          console.log(result)
          return simpleStorageInstance.get.call(accounts[0])
        })
        .then(result => {
          // Update state with the result.
          console.log(result)
          return this.setState({ storageValue: result.c[0] })
        })
    })
  }

  renderGrid(context) {
    const colors = ["#ffee58", "#26a69a", "#ff7043", "#ec407a"]
    for (var i = 0; i < 50; i++) {
      for (var j = 0; j < 50; j++) {
        context.fillStyle = colors[Math.floor(Math.random() * colors.length)]
        context.fillRect(i * 10, j * 10, 50, 50)
      }
    }
  }

  componentDidMount() {
    var canvas = document.getElementById("pixel-grid")
    if (canvas.getContext) {
      const context = canvas.getContext("2d")
      this.renderGrid(context)
    }
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">
            Truffle Box
          </a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <p>The stored value is: {this.state.storageValue}</p>
              <canvas id="pixel-grid" width="500" height="500" />
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default App
