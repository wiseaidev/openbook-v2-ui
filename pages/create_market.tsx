import { useState } from "react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { OracleConfigParams } from "@openbook-dex/openbook-v2";
import { useOpenbookClient } from "../hooks/useOpenbookClient";
import { useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";

const CreateMarket = () => {
  const { publicKey } = useWallet();

  const [formState, setFormState] = useState({
    name: '',
    quoteMint: PublicKey.default,
    baseMint: PublicKey.default,
    quoteLotSize: '',
    baseLotSize: '',
    makerFee: '0',
    takerFee: '0',
    timeExpiry: '0',
    oracleA: null,
    oracleB: null,
    openOrdersAdmin: PublicKey.default,
    consumeEventsAdmin: PublicKey.default,
    closeMarketAdmin: PublicKey.default,
    confFilter: '0.1',
    maxStalenessSlots: '100',
  });

  const openbookClient = useOpenbookClient();

  const fields = [
    { label: 'Name', field: 'name', type: 'text', isPublicKey: false },
    { label: 'Quote Mint', field: 'quoteMint', type: 'text', isPublicKey: true },
    { label: 'Base Mint', field: 'baseMint', type: 'text', isPublicKey: true },
    { label: 'Quote Lot Size', field: 'quoteLotSize', type: 'text',  isPublicKey: false },
    { label: 'Base Lot Size', field: 'baseLotSize', type: 'text',  isPublicKey: false },
    { label: 'Maker Fee', field: 'makerFee', type: 'text',  isPublicKey: false },
    { label: 'Taker Fee', field: 'takerFee', type: 'text',  isPublicKey: false },
    { label: 'Time Expiry (Only for markets that can be closed)', field: 'timeExpiry', type: 'text',  isPublicKey: false },
    { label: 'Oracle A (Optional)', field: 'oracleA', type: 'text', isPublicKey: true },
    { label: 'Oracle B (Optional)', field: 'oracleB', type: 'text', isPublicKey: true },
    { label: 'Max Staleness Slots (Optional)', field: 'maxStalenessSlots', type: 'text',  isPublicKey: false },
    { label: 'Configuration Filter (Optional)', field: 'confFilter', type: 'text',  isPublicKey: false },
    { label: 'Open Orders Admin (Permissioned Markets)', field: 'openOrdersAdmin', type: 'text', isPublicKey: true },
    { label: 'Consume Events Admin (Permissioned Markets)', field: 'consumeEventsAdmin', type: 'text', isPublicKey: true },
    { label: 'Close Market Admin (Permissioned Markets)', field: 'closeMarketAdmin', type: 'text', isPublicKey: true },
  ];

  const handleChange = (e, field, isPublicKey) => {
    let value;
    if (isPublicKey) {
      try {
        value = new PublicKey(e.target.value);
      } catch (error) {
        console.error("Invalid PublicKey:", e.target.value);
        value = e.target.value;
      }
    } else {
      value = e.target.value;
    }

    setFormState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();


    const oracleConfigParams: OracleConfigParams = {
      confFilter: Number(formState.confFilter),
      maxStalenessSlots: Number(formState.maxStalenessSlots),
    };
    try {  console.log(JSON.stringify(formState, null, 2));
      openbookClient
        .createMarket(
          formState.publicKey,
          formState.name,
          formState.quoteMint,
          formState.baseMint,
          new BN(formState.quoteLotSize),
          new BN(formState.baseLotSize),
          new BN(formState.makerFee),
          new BN(formState.takerFee),
          new BN(formState.timeExpiry),
          formState.oracleA,
          formState.oracleB,
          formState.openOrdersAdmin,
          formState.consumeEventsAdmin,
          formState.closeMarketAdmin,
          formState.oracleConfigParams
        )
        .then(async ([transactionInstructions, signers]) => {
          const tx = await openbookClient.sendAndConfirmTransaction(
            [...transactionInstructions],
            {
              additionalSigners: signers,
            }
          );
          console.log("Create Market tx", tx);
          toast("Create Market tx: " + tx);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.log("Error on the form", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-white-900">
            Create a market
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {fields.map(({ label, field, type, isPublicKey }, index) => (
              <div key={index} className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-white-900">
                  {label}
                </label>
                <div className="mt-2">
                  <input
                    type={type}
                    value={formState[field]}
                    onChange={(e) => handleChange(e, field, isPublicKey)}
                    className="block w-full rounded-md py-1.5 pl-2 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 items-center">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Create Market
        </button>
      </div>
    </form>
  );
};

export default CreateMarket;
