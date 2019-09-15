const doughnutMaker = require('@plugnet/doughnut-maker');
const cennznut = require('@cennznet/cennznut');
const cennznet = require('@cennznet/api');
const Keyring = require('@plugnet/keyring');
const testingPairs = require('@plugnet/keyring/testingPairs');
const util = require('@plugnet/util');
const _wasmCrypto = require("@plugnet/wasm-crypto");

/// Helper for creating CENNZnuts
function makeCennznut(module, method) {
  return cennznut.encode(0, {
    "modules": {
      [module]: {
        "methods": {
          [method]: {}
        }
      }
    }
  });
}

/// Helper for creating v0 Doughnuts
async function makeDoughnut(
  issuer,
  holder,
  permissions,
) {
  return await doughnutMaker.generate(
    0,
    0,
    {
      issuer: issuer.publicKey,
      holder: holder.publicKey,
      expiry: Math.round(((new Date()).getTime() + 10000) / 1000),
      block_cooldown: 0,
      permissions: permissions,
    },
    issuer
  );
}

async function main() {
    await (0, _wasmCrypto.waitReady)();
    const api = await cennznet.Api.create({provider: 'ws://localhost:9944/'});
    keyring = testingPairs.default({ type: 'sr25519' });

    let aliceKeyPair = {
      secretKey: util.hexToU8a('0x98319d4ff8a9508c4bb0cf0b5a78d760a0b2082c02775e6e82370816fedfff48925a225d97aa00682d6a59b95b18780c10d7032336e88f3442b42361f4a66011'),
      publicKey: util.hexToU8a('0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d')
    };

    let doughnut = await makeDoughnut(
      aliceKeyPair,
      keyring.bob,
      { "cennznet": makeCennznut("generic-asset", "transfer") }
    );
    
    const tx = api.tx.genericAsset.transfer(16001, keyring.charlie.address, 10000);
    tx.addDoughnut(doughnut);

    await tx.signAndSend(keyring.bob);
}

main().catch(console.error).finally(() => process.exit());
