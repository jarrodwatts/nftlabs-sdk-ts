import { IThirdwebModule__factory } from "@3rdweb/contracts";
import { Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import { ContractType } from "../types";

/**
 * @internal
 *
 * @param contractAddress - the address of the contract to check for a valid contract type
 * @throws if the contract type cannot be determined
 * @returns the contract type
 */
export async function getContractTypeForAddress<
  TContractType extends ContractType,
>(
  contractAddress: string,
  signerOrProvider: Signer | Provider,
): Promise<TContractType> {
  const contract = IThirdwebModule__factory.connect(
    contractAddress,
    signerOrProvider,
  );
  return (await contract.moduleType()) as TContractType;
}
