const AirdropApi = require('./smart-contract/api/airdropApi');
const ERC20Token = require('./smart-contract/api/erc20-token-api');
const WalletUtils = require('./smart-contract/wallet-utils');
const Airdropper = require('./airdropper');
const Config = require('./config.json');
const CreateAirdrop = require('./airdrop/create_aridrop_data');

const msAdmin = Config.adminMnemonics;
const msClaimer = Config.claimerMnemonics;

const Admin = WalletUtils.getAddressAndPrivateKeyFromMnemonic(msAdmin);
const Claimer = WalletUtils.getAddressAndPrivateKeyFromMnemonic(msClaimer);

// Ropsten deployment address of Mui Token
const MUI_TOKEN_CONTRACT_ADDRESS = Config.MUI_TOKEN_CONTRACT_ADDRESS;


const IS_FIREBASE = true;
function main() {
    if(IS_FIREBASE) {
        CreateAirdrop.init(Admin);  
    } else {
        createLocalDB();
    }
}

function createLocalDB() {
    console.log("Admin: ", Admin, msAdmin);
    console.log("Claimer: ", Claimer, msClaimer);

    let db = createAirdropBalanceDB(accounts, 100);


    let airdropper = new Airdropper(db);
    let MuiToken = new ERC20Token(MUI_TOKEN_CONTRACT_ADDRESS, null, 6);

    console.log('Roothash DB: ', airdropper.getRootHash());
    console.log('Balance: ', airdropper.getBalance(0));

    // Utils.signAndSendTransaction('0x5EF8e4950f0de565860B233f253aE70b102E97B7', Sender, 20000000000).gasOptions()
    //     .then(tx => console.log('Send tx:', tx))
    //     .catch(e => console.log('send error:', e));

    MuiToken.balanceOf(AirdropApi.getContractAddress())
        .then(balance => console.log(`Airdrop-Contract balance: ${balance.toString()} MUI`))
        .catch(e => console.log('balanceOf error:', e));

    // MuiToken.transfer(Admin, AirdropApi.getContractAddress(), 50000)
    //     .then(balance => console.log('Admin balance:', balance.toString()))
    //     .catch(e => console.log('transfer error:', e));

    AirdropApi.isPaused()
        .then(paused => {
            console.log('IsPaused:', paused);

            if(paused) {
                AirdropApi.setIncentives(Admin, '0x9954d5f22e57edfa0fa39ac2e820575c3d02309210234830795c026ac9a8c91f')
                    .then(tx => {
                        console.log('SetIncentives tx:', tx);

                        AirdropApi.unpause(Admin)
                            .then(tx => console.log('Pause tx:', tx))
                            .catch(e => console.log('Pause error:', e));
                    })
                    .catch(e => console.log('SetIncentives error:', e));
            } else {
                AirdropApi.pause(Admin)
                    .then(tx => {
                        console.log('Pause tx:', tx);

                        // AirdropApi.setIncentives(Admin, '0x9391a6d68484b1bdb5bdb503ecf61ed0bb42cd764b782e9de1fa9ba2efaf6c95')
                        //     .then(tx => {
                        //         console.log('SetIncentives tx:', tx);
                        //
                        //         AirdropApi.unpause(Admin)
                        //             .then(tx => console.log('Pause tx:', tx))
                        //             .catch(e => console.log('Pause error:', e));
                        //     })
                        //     .catch(e => console.log('SetIncentives error:', e));
                    })
                    .catch(e => console.log('Pause error:', e));
            }
        })
        .catch(e => console.log('IsPaused error:', e));

    AirdropApi.getVersion()
        .then(version => console.log('Version:', version))
        .catch(e => console.log('GetVersion error:', e));

    AirdropApi.getIncentiveRoothash()
        .then(hash => console.log('Roothash:', hash))
        .catch(e => console.log('getIncentiveRoothash error:', e));

    AirdropApi.isClaimed(0)
        .then(claimed => console.log('isClaimed:', claimed))
        .catch(e => console.log('isClaimed error:', e));

    // AirdropApi.claim(Claimer, 0, 50, airdropper.getMerkleProof(0))
    //     .then(tx => console.log('Claim:', tx))
    //     .catch(e => console.log('Claim error:', e));



    // AirdropApi.isPaused()
    //     .then(paused => console.log('IsPaused:', paused))
    //     .catch(e => console.log('IsPaused error:', e));

    // AirdropApi.setIncentives(Admin, airdropper.getRootHash())
    //     .then(tx => console.log('SetIncentives tx:', tx))
    //     .catch(e => console.log('SetIncentives error:', e));

    // AirdropApi.unpause(Admin)
    //      .then(tx => console.log('Pause tx:', tx))
    //      .catch(e => console.log('Pause error:', e));


}


const accounts = [
    '0xcc8a0fb39284c4704d14c0a18f566a1ed53dd84a', // Claimer address
    '0xf17f52151ebef6c7334fad080c5704d77216b732',
    '0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef',
    '0x821aea9a577a9b44299b9c15c88cf3087f3b5544',
    '0x0d1d4e623d10f9fba5db95830f7d3839406c6af2',
    '0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e',
    '0x2191ef87e392377ec08e7c08eb105ef5448eced5',
    '0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5',
    '0x6330a553fc93768f612722bb8c2ec78ac90b3bbc',
    '0x5aeda56215b167893e80b4fe645ba6d5bab767de'
];

function createAirdropBalanceDB(accounts, multiplier) {
    let db = {};
    console.log('\n---------------------- AirDrop Addresses -----------------------');
    console.log('-Index\t\t\tAddress\t\t\t\tBalance');
    accounts.map((address, index) => {
        db[address] = (index * multiplier + 50).toString(); 
        console.log(`- ${index}\t${address}\t${db[address]}`);
    });
    console.log('----------------------------------------------------------------');
    return db;
}

main();