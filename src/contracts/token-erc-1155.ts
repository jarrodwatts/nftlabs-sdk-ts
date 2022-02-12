import { Erc1155 } from "../core/classes/erc-1155";
import { TokenERC1155, TokenERC1155__factory } from "@3rdweb/contracts";
import { ContractMetadata } from "../core/classes/contract-metadata";
import { ContractRoles } from "../core/classes/contract-roles";
import { ContractRoyalty } from "../core/classes/contract-royalty";
import { ContractPrimarySale } from "../core/classes/contract-sales";
import {
  IStorage,
  NetworkOrSignerOrProvider,
  TransactionResultWithId,
} from "../core";
import { SDKOptions } from "../schema/sdk-options";
import { ContractWrapper } from "../core/classes/contract-wrapper";
import { TokenErc1155ContractSchema } from "../schema/contracts/token-erc1155";
import { BundleMetadata, BundleMetadataInput } from "../schema/tokens/bundle";
import { TokenMintedEvent } from "@3rdweb/contracts/dist/TokenERC721";
import { ContractEncoder } from "../core/classes/contract-encoder";
import { CommonNFTInput } from "../schema/tokens/common";

/**
 * Setup a collection of one-of-one NFTs that are minted as users claim them.
 *
 * @example
 *
 * ```javascript
 * import { ThirdwebSDK } from "@3rdweb/sdk";
 *
 * // You can switch out this provider with any wallet or provider setup you like.
 * const provider = ethers.Wallet.createRandom();
 * const sdk = new ThirdwebSDK(provider);
 * const contract = sdk.getBundleContract("{{contract_address}}");
 * ```
 *
 * @public
 */
export class TokenErc1155Contract extends Erc1155<TokenERC1155> {
  static contractType = "TokenERC1155" as const;
  static contractRoles = ["admin", "minter", "transfer"] as const;
  static contractFactory = TokenERC1155__factory;
  /**
   * @internal
   */
  static schema = TokenErc1155ContractSchema;

  public metadata: ContractMetadata<
    TokenERC1155,
    typeof TokenErc1155Contract.schema
  >;
  public roles: ContractRoles<
    TokenERC1155,
    typeof TokenErc1155Contract.contractRoles[number]
  >;
  public royalty: ContractRoyalty<
    TokenERC1155,
    typeof TokenErc1155Contract.schema
  >;
  public primarySales: ContractPrimarySale<TokenERC1155>;
  public encoder: ContractEncoder<TokenERC1155>;

  constructor(
    network: NetworkOrSignerOrProvider,
    address: string,
    storage: IStorage,
    options: SDKOptions = {},
    contractWrapper = new ContractWrapper<TokenERC1155>(
      network,
      address,
      TokenErc1155Contract.contractFactory.abi,
      options,
    ),
  ) {
    super(contractWrapper, storage, options);
    this.metadata = new ContractMetadata(
      this.contractWrapper,
      TokenErc1155Contract.schema,
      this.storage,
    );
    this.roles = new ContractRoles(
      this.contractWrapper,
      TokenErc1155Contract.contractRoles,
    );
    this.royalty = new ContractRoyalty(this.contractWrapper, this.metadata);
    this.primarySales = new ContractPrimarySale(this.contractWrapper);
    this.encoder = new ContractEncoder(this.contractWrapper);
  }

  /** ******************************
   * READ FUNCTIONS
   *******************************/

  /** ******************************
   * WRITE FUNCTIONS
   *******************************/

  /**
   * Mint NFT for the connected wallet
   *
   * See {@link TokenErc1155Contract.mintTo}
   */
  public async mint(
    metadataWithSupply: BundleMetadataInput,
  ): Promise<TransactionResultWithId<BundleMetadata>> {
    return this.mintTo(
      await this.contractWrapper.getSignerAddress(),
      metadataWithSupply,
    );
  }

  /**
   * Mint an NFT with a limited supply
   *
   * @remarks Mint an NFT with a limited supply to a specified wallet.
   *
   * @example
   * ```javascript
   * // Address of the wallet you want to mint the NFT to
   * const toAddress = "{{wallet_address}}"
   *
   * // Custom metadata of the NFT, note that you can fully customize this metadata with other properties.
   * const metadata = {
   *   name: "Cool NFT",
   *   description: "This is a cool NFT",
   *   image: fs.readFileSync("path/to/image.png"), // This can be an image url or file
   * }
   *
   * const metadataWithSupply = {
   *   metadata,
   *   supply: 1000, // The number of this NFT you want to mint
   * }
   *
   * const tx = await contract.mintTo(toAddress, metadataWithSupply);
   * const receipt = tx.receipt; // the transaction receipt
   * const tokenId = tx.id; // the id of the NFT minted
   * const nft = await tx.data(); // (optional) fetch details of minted NFT
   * ```
   */
  public async mintTo(
    to: string,
    metadataWithSupply: BundleMetadataInput,
  ): Promise<TransactionResultWithId<BundleMetadata>> {
    const uri = await this.storage.uploadMetadata(
      CommonNFTInput.parse(metadataWithSupply.metadata),
    );
    const receipt = await this.contractWrapper.sendTransaction("mintTo", [
      to,
      uri,
      metadataWithSupply.supply,
    ]);
    const event = this.contractWrapper.parseLogs<TokenMintedEvent>(
      "TokenMinted",
      receipt?.logs,
    );
    if (event.length === 0) {
      throw new Error("TokenMinted event not found");
    }
    const id = event[0].args.tokenIdMinted;
    return {
      id,
      receipt,
      data: () => this.get(id.toString()),
    };
  }

  /**
   * Mint Many NFTs for the connected wallet
   *
   * See {@link TokenErc1155Contract.mintBatchTo}
   */
  public async mintBatch(
    metadatas: BundleMetadataInput[],
  ): Promise<TransactionResultWithId<BundleMetadata>[]> {
    return this.mintBatchTo(
      await this.contractWrapper.getSignerAddress(),
      metadatas,
    );
  }

  /**
   * Mint Many NFTs with limited supplies
   *
   * @remarks Mint many different NFTs with limited supplies to a specified wallet.
   *
   * @example
   * ```javascript
   * // Address of the wallet you want to mint the NFT to
   * const toAddress = "{{wallet_address}}"
   *
   * // Custom metadata and supplies of your NFTs
   * const metadataWithSupply = [{
   *   supply: 50, // The number of this NFT you want to mint
   *   metadata: {
   *     name: "Cool NFT #1",
   *     description: "This is a cool NFT",
   *     image: fs.readFileSync("path/to/image.png"), // This can be an image url or file
   *   },
   * }, {
   *   supply: 100,
   *   metadata: {
   *     name: "Cool NFT #2",
   *     description: "This is a cool NFT",
   *     image: fs.readFileSync("path/to/image.png"), // This can be an image url or file
   *   },
   * }];
   *
   * const tx = await contract.mintBatchTo(toAddress, metadataWithSupply);
   * const receipt = tx[0].receipt; // same transaction receipt for all minted NFTs
   * const firstTokenId = tx[0].id; // token id of the first minted NFT
   * const firstNFT = await tx[0].data(); // (optional) fetch details of the first minted NFT
   * ```
   */
  public async mintBatchTo(
    to: string,
    metadataWithSupply: BundleMetadataInput[],
  ): Promise<TransactionResultWithId<BundleMetadata>[]> {
    const metadatas = metadataWithSupply.map((a) => a.metadata);
    const supplies = metadataWithSupply.map((a) => a.supply);
    const { metadataUris: uris } = await this.storage.uploadMetadataBatch(
      metadatas.map((m) => CommonNFTInput.parse(m)),
    );
    const encoded = uris.map((uri, index) =>
      this.contractWrapper.readContract.interface.encodeFunctionData("mintTo", [
        to,
        uri,
        supplies[index],
      ]),
    );
    const receipt = await this.contractWrapper.multiCall(encoded);
    const events = this.contractWrapper.parseLogs<TokenMintedEvent>(
      "TokenMinted",
      receipt.logs,
    );
    if (events.length === 0 || events.length < metadatas.length) {
      throw new Error("TokenMinted event not found, minting failed");
    }
    return events.map((e) => {
      const id = e.args.tokenIdMinted;
      return {
        id,
        receipt,
        data: () => this.get(id),
      };
    });
  }
}
