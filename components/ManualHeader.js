// can do .jsx or .js... same thing
import { useMoralis } from "react-moralis"
import { useEffect } from "react"
import Moralis from "moralis"

// components are little chunks of html

export default function ManualHeader() {
    // this is a 'hook'
    // allows you to change the rendering of your frontend based on state
    // if it were just a variable it wouldnt do that.

    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
        useMoralis()

    // use effect - takes a function as first parameter, and then a depencey array in second slot. If anything changes in the array it will change.

    useEffect(() => {
        if (isWeb3Enabled) return
        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3()
            }
        }
    }, [isWeb3Enabled])
    // automatically runs on load
    // if you dont give it the depenendency array it will run anytime anything re-renders. can lead to circular errors.
    // if blank dependency array it runs only on load.
    // if you do the array it only look at those hooks for when they change.

    // in jsx you can stick javascript inside html in places you wouldnt be able to with raw html. e.g. putting some javascript within the button tag below
    // {} indicates youre going to use javascript within these html tags.

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`)
            if (account == null) {
                // assumes they've disconnected
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Null account found")
            }
        })
    })

    return (
        <div>
            {account ? (
                <div>
                    Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                        // this is going to help us store if someone is connected so that if they refresh page it still knows they are connected.
                        if (typeof window !== "undefined") {
                            window.localStorage.setItem("connected", "injected") // injected = metamask
                        } else {
                            console.log("undefined")
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}{" "}
            Hi from Manual header!
        </div>
    )
}

// the hard way first then the easy way...
