// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
// Import our contract artifacts and turn them into usable abstractions.
import multiplierArtifacts from '../../build/contracts/MultiplierHolder.json'
import regulatorArtifacts from '../../build/contracts/Regulator.json'
import routePriceHolderArtifacts from '../../build/contracts/RoutePriceHolder.json'
import tollBoothOperatorArtifacts from '../../build/contracts/TollBoothOperator.json'
import tollBoothHolderArtifacts from '../../build/contracts/TollBoothHolder.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MultiplierHolder = contract(multiplierArtifacts)
var Regulator = contract(regulatorArtifacts)
var RoutePriceHolder = contract(routePriceHolderArtifacts)
var TollBoothOperator = contract(tollBoothOperatorArtifacts)
var TollBoothHolder = contract(tollBoothHolderArtifacts)


// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts
var account

window.App = {
  start: function () {
    var self = this

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0]

      self.refreshBalance()
    })
  },

  setStatus: function (message) {
    var status = document.getElementById('status')
    status.innerHTML = message
  },

  refreshBalance: function () {
    var self = this

    var meta
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      return meta.getBalance.call(account, { from: account })
    }).then(function (value) {
      var balance_element = document.getElementById('balance')
      balance_element.innerHTML = value.valueOf()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },

  sendCoin: function () {
    var self = this

    var amount = parseInt(document.getElementById('amount').value)
    var receiver = document.getElementById('receiver').value

    this.setStatus('Initiating transaction... (please wait)')

    var meta
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      return meta.sendCoin(receiver, amount, { from: account })
    }).then(function () {
      self.setStatus('Transaction complete!')
      self.refreshBalance()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error sending coin; see log.')
    })
  },

  setVehicleType: function () {
    var self = this

    let vehicleType = parseInt(document.getElementById('vehicleType').value)
    let recipient = document.getElementById('address').value
    let regulatorInstance

    if (vehicleType > 3 || vehicleType < 0) {
      console.log('Error')
      self.setStatus('Vehicle type value must be between 0 and 3')
      return 0
    }
    Regulator.deployed().then((instance) => {
      regulatorInstance = instance
      return regulatorInstance.setVehicleType(vehicleType, recipient, { from: account })
    }).then(() => {
      self.setStatus('Vehicle type set')
      self.refreshBalance()
    }).catch((e) => {
      console.log(e)
      self.setStatus('An error occured while setting vehicle type')
    })
  },

  createNewOperator: () => {
    var self = this

    let amount = parseInt(document.getElementById('amount').value)
    let recipient = document.getElementById('recipient').value

    let regulatorInstance
    Regulator.deployed().then((instance) => {
      regulatorInstance = instance
      return regulatorInstance.createNewOperator(recipient, amount, { from: account })
    }).then(() => {
      self.setStatus('Vehicle type set')
      self.refreshBalance()
    }).catch((e) => {
      console.log(e)
      self.setStatus('An error occured while setting vehicle type')
    })
  },

  addTollBooth: () => {
    var self = this

    let createdTollBoothAddress = document.getElementById('createdTollBooth').value

    let tollBoothHolderInstance
    TollBoothHolder.deployed().then((instance) => {
      tollBoothHolderInstance = instance
      return tollBoothHolderInstance.addTollBooth(createdTollBoothAddress, { from: account })
    }).then(() => {
      self.setStatus('New toll booth added: ' + createdTollBoothAddress)
      self.refreshBalance()
    }).catch((e) => {
      console.log(e)
      self.setStatus('An error occured while setting vehicle type')
    })
  },

  setRoutePrice: () => {
    var self = this

    let entryBooth = document.getElementById('entryBooth').value
    let exitBooth = document.getElementById('exitBooth').value
    
    let routePriceHolderInstance
    RoutePriceHolder.deployed().then((instance) => {
      routePriceHolderInstance = instance
      return routePriceHolderInstance.setRoutePrice(entryBooth, exitBooth, { from: account })
    }).then(() => {
      self.setStatus('Vehicle type set')
      self.refreshBalance()
    }).catch((e) => {
      console.log(e)
      self.setStatus('An error occured while setting vehicle type')
    })
  },

  setMultiplier: () => {
    var self = this

    let vehicleType = parseInt(document.getElementById('multiplierVehicleType').value)
    let multiplier = parseInt(document.getElementById('multiplier').value)

    let multiplierInstance
    MultiplierHolder.deployed().then((instance) => {
      multiplierInstance = instance
      return multiplierInstance.setMultiplier(vehicleType, multiplier, { from: account })
    }).then(() => {
      self.setStatus('Multiplier set')
      self.refreshBalance()
    }).catch((e) => {
      console.log(e)
      self.setStatus('An error occured while setting multiplier type')
    })
  },

  reportExitRoad: () => {
    var self = this
    let amount = parseInt(document.getElementById('amount').value)
    let recipient = document.getElementById('recipient').value

    let regulatorInstance
    Regulator.deployed().then((instance) => {
      regulatorInstance = instance
      return regulatorInstance.setVehicleType(recipient, amount, { from: account })
    }).then(() => {
      self.setStatus('Vehicle type set')
      self.refreshBalance()
    }).catch((e) => {
      console.log(e)
      self.setStatus('An error occured while setting vehicle type')
    })
  }
}

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask")
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
  }

  App.start()
})

function openTab (evt, cityName) {
  // Declare all variables
  var i, tabcontent, tablinks

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName('tabcontent')
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = 'none'
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName('tablinks')
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '')
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(cityName).style.display = 'block'
  evt.currentTarget.className += ' active'
}