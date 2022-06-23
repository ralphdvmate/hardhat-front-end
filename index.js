import { ethers } from "./ethers-5.6.0.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const btnConnect = document.getElementById("btnConnect")
const btnBalance = document.getElementById("btnBalance")
const btnFund = document.getElementById("btnFund")
const btnWithdraw = document.getElementById("btnWithdraw")
btnConnect.onclick = connect
btnBalance.onclick = getBalance
btnFund.onclick = fund
btnWithdraw.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        btnConnect.innerHTML = "Connected"
    } else {
        btnConnect.innerHTML = "Please install metamask"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    if (typeof window.ethereum !== "undefined") {
        console.log(`Funding with ${ethAmount}...`)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })

            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        console.log(`Getting balance...`)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)

        document.getElementById(
            "ethBalance"
        ).innerText = `ETH ${ethers.utils.formatEther(balance)}`
        console.log()
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log(`Withdrawing balance...`)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)

    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}
