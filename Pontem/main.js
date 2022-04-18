import { ApiPromise, WsProvider } from "@polkadot/api";

const telegramToken = '';
const telegramRoom = '';

const chains = [
    {
        name: "Pontem Testnet",
        ws: 'wss://testnet.pontem.network/ws',
        validator: 'gkNb1azgNjM8cZEF8An6yCahaCLPbkKmyxvpNfFKhLEViyUge',
        token: 'PONT'
    }
]


async function processChain(c) {
    const stats = {
        activeCollators: -1,
        candidatePoolSize: -1,
        minStake: {
            value: -1,
            account: null
        },
	ahead: 0,
	ourStake: -1
    };

    const provider = new WsProvider(c.ws);
    const api = await ApiPromise.create({ provider });

    const candidatePool = await api.query.parachainStaking.candidatePool();
    stats.candidatePoolSize = candidatePool.length;

    if (c.validator) {
        let ourState = await api.query.parachainStaking.collatorState2(c.validator);
        ourState = ourState.toJSON();
	    candidatePool.forEach(element => {
            if (element.amount > ourState.totalBacking) {
                stats.ahead++;     
            }
        });
        stats.ourStake = ourState.totalBacking / 10000000000;
    }

    let selectedCollators = await api.query.parachainStaking.selectedCandidates()
    selectedCollators = selectedCollators.map((authorityId) => authorityId.toString());                                 
    
    stats.activeCollators = selectedCollators.length;

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

    stats.minStake.value = minBacking / 10000000000;
    stats.minStake.account = minBackingCollator;

    return stats;
}



async function main() {
    for (let index = 0; index < chains.length; index++) {
        const c = chains[index];
        const s = await processChain(c);

        const message = `${c.name} 
        Active collators: ${s.activeCollators}
        Candidate pool size: ${s.candidatePoolSize}
        Our stake: ${s.ourStake} PONT
        Min stake: ${s.minStake.value} ${c.token}
        Ahead: ${s.ahead}`; // (${s.minStake.account})`;
        console.log(message);
    }
}

main().catch(console.error).finally(() => process.exit());
