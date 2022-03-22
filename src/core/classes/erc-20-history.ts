import { ContractWrapper } from "./contract-wrapper";
import { BigNumber } from "ethers";
import { TokenERC20 } from "@thirdweb-dev/contracts";
import { AddressZero } from "@ethersproject/constants";

/**
 * Manages claim conditions for Edition Drop contracts
 * @public
 */
export class TokenERC20History {
  private contractWrapper;

  constructor(contractWrapper: ContractWrapper<TokenERC20>) {
    this.contractWrapper = contractWrapper;
  }

  /** ***************************************
   * READ FUNCTIONS
   *****************************************/

  /**
   * Get all holder balances
   *
   * @remarks Lets you get all token holders and their corresponding balances
   * @returns - A JSON object of all token holders and their corresponding balances
   * @example
   * ```javascript
   * const allHolderBalances = await contract.history.getAllHolderBalances();
   * ```
   */
  public async getAllHolderBalances(): Promise<Record<string, BigNumber>> {
    const a = await this.contractWrapper.readContract.queryFilter(
      this.contractWrapper.readContract.filters.Transfer(),
    );
    const txns = a.map((b) => b.args);
    const balances: {
      [key: string]: BigNumber;
    } = {};
    txns.forEach((item) => {
      const from = item.from;
      const to = item.to;
      const amount = item.value;

      if (!(from === AddressZero)) {
        if (!(from in balances)) {
          balances[from] = BigNumber.from(0);
        }
        balances[from] = balances[from].sub(amount);
      }
      if (!(to === AddressZero)) {
        if (!(to in balances)) {
          balances[to] = BigNumber.from(0);
        }
        balances[to] = balances[to].add(amount);
      }
    });
    return balances;
  }
}
