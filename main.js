import { ApiPromise, WsProvider } from "@polkadot/api";

async function main() {
    // Test on Moonbase alpha, Pontem is down
    // pontem ws provider: wss://testnet.pontem.network
    const wsProvider = new WsProvider('wss://wss.api.moonbase.moonbeam.network');
    const api = await ApiPromise.create({ provider: wsProvider });

    // get collators selected in the active set
    let selectedCollators = await api.query.parachainStaking.selectedCandidates()
    selectedCollators = selectedCollators.map((authorityId) => authorityId.toString());                                 
    console.log(selectedCollators);

    /*let minBacking = 0;
    selectedCollators.forEach(collator => {
        let collatorState = await api.query.parachainStaking.collatorState2(collator);
        if (minBacking == 0 || minBacking < collatorState.totalBacking) {
            minBacking = collatorState.totalBacking;
            minBackingCollator = collator;
        }
    });
    console.log(`Min backing: ${minBackingCollator} with ${minBacking} PONT`);*/
}

main().catch(console.error).finally(() => process.exit());
