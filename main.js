import { ApiPromise, WsProvider } from "@polkadot/api";

async function main() {
    // set ws provider
    const wsProvider = new WsProvider('wss://testnet.pontem.network/ws');
    const api = await ApiPromise.create({ provider: wsProvider });

    // get collators selected in the active set
    let selectedCollators = await api.query.parachainStaking.selectedCandidates()
    selectedCollators = selectedCollators.map((authorityId) => authorityId.toString());                                 
    console.log(`There are ${selectedCollators.length} active collators`);

    // get collator state's and display the one with less PONT
    let collatorState = await api.query.parachainStaking.collatorState2(selectedCollators[0]);
    let minBacking = collatorState.toJSON().totalBacking;
    let minBackingCollator = selectedCollators[0];
    for (let index = 1; index < selectedCollators.length; index++) {
        collatorState = await api.query.parachainStaking.collatorState2(selectedCollators[index]);
        collatorState = collatorState.toJSON();
        if (minBacking > collatorState.totalBacking) {
            minBacking = collatorState.totalBacking;
            minBackingCollator = selectedCollators[index];
        }
    }
    console.log(`Min backing: ${minBackingCollator} with ${minBacking / 10000000000} PONT`);
}

main().catch(console.error).finally(() => process.exit());
