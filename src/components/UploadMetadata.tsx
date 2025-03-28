import { FC, useCallback, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey } from '@solana/web3.js';
import {
  DataV2,
  createUpdateMetadataAccountV2Instruction,
  PROGRAM_ID
} from "@metaplex-foundation/mpl-token-metadata";

export const UpdateMetadata: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [tokenMint, setTokenMint] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [metadata, setMetadata] = useState('');

  const onClick = useCallback(async (form) => {
    if (!form.tokenMint || !form.tokenName || !form.symbol || !form.metadata) {
      console.error("All fields are required.");
      return;
    }

    try {
      const mint = new PublicKey(form.tokenMint);
      const metadataPDA = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        PROGRAM_ID,
      )[0];

      // Token metadata structure
      const tokenMetadata = {
        name: form.tokenName, 
        symbol: form.symbol,
        uri: form.metadata,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
      } as DataV2;

      // Creating the metadata update transaction
      const updateMetadataTransaction = new Transaction().add(
        createUpdateMetadataAccountV2Instruction(
          {
            metadata: metadataPDA,
            updateAuthority: publicKey, // Ensure updateAuthority is set to publicKey
          },
          {
            updateMetadataAccountArgsV2: {
              data: tokenMetadata,
              updateAuthority: publicKey,  // Prevent further updates by using the same authority
              primarySaleHappened: true,  // Optional: Set to true or false depending on your needs
              isMutable: false,  // Make metadata immutable, preventing further updates
            },
          }
        )
      );

      // Send the transaction
      await sendTransaction(updateMetadataTransaction, connection);
      console.log("Metadata updated successfully!");
    } catch (error) {
      console.error("Error updating metadata:", error);
    }
  }, [publicKey, connection, sendTransaction]);

  return (
    <div className="my-6">
      {/* Input fields */}
      <input
        type="text"
        className="form-control block mb-2 w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        placeholder="Token Mint Address"
        onChange={(e) => setTokenMint(e.target.value)}
      />
      <input
        type="text"
        className="form-control block mb-2 w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        placeholder="Token Name"
        onChange={(e) => setTokenName(e.target.value)}
      />
      <input
        type="text"
        className="form-control block mb-2 w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        placeholder="Symbol"
        onChange={(e) => setSymbol(e.target.value)}
      />
      <input
        type="text"
        className="form-control block mb-2 w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        placeholder="Metadata Url"
        onChange={(e) => setMetadata(e.target.value)}
      />
      <button
        className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
        onClick={() =>
          onClick({
            metadata: metadata,
            symbol: symbol,
            tokenName: tokenName,
            tokenMint: tokenMint
          })
        }
      >
        <span>Update Metadata</span>
      </button>
    </div>
  );
};
