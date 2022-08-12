// have a function to enter the lottery.
// moralis has a hook: useWeb3Contract. gives data returned, error, isFetching, isLoading etc.
// just pass it abi, address, name of function and any parameters

import { useWeb3Contract } from "react-moralis"
// import abi from "../constants/abi.json"
import { abi, contractAddresses } from "../constants" // can just specify the folder bc we have index.js
import { useMoralis } from "react-moralis"
import React, { useEffect, useState } from "react"
import { ethers } from "ethers"

// hook for the notifications
import { useNotification } from "@web3uikit/core"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis() // this is the HEX version of the chainId
    // console.log(chainIdHex)
    // console.log(parseInt(chainIdHex))
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null // if then

    // let entranceFee = "" need this to be a hook not a normal variable, so that the page can re-render when this changes.
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setrecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    // try to read the raffle entrance fee
    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()

        setEntranceFee(entranceFeeFromCall, "ether")
        setNumPlayers(numPlayersFromCall)
        setrecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        // somehow this causes isWeb3Enabled to go from false to true
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI() // by putting this within handle success it allows us to re-render the number of players in the lottery in real time (instead of requiring a user refresh)
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: React.ReactElement,
        })
    }

    return (
        <div className="p-5">
            Hi from lottery entrance!
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 round ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess, // comes with onSuccess, onComplete, onError
                                // onSuccess checks to make sure it it sent to metamask... NOT checking for block confirmations.
                                // that's why in handleSuccess we do tx.wait(1)
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <div>Number of Players: {numPlayers}</div>
                    <div>Recent Winner: {recentWinner}</div>
                </div>
            ) : (
                <div>No raffle address detected.</div>
            )}
        </div>
    )
}
