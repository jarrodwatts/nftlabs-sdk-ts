<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@3rdweb/sdk](./sdk.md) &gt; [ClaimProof](./sdk.claimproof.md)

## ClaimProof class

The model for a claim proof. Currently we support only an address in the leaf of the merkle tree.

<b>Signature:</b>

```typescript
export declare class ClaimProof 
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [address](./sdk.claimproof.address.md) |  | string | The address of the account that owns the claim. |
|  [proof](./sdk.claimproof.proof.md) |  | string\[\] | The proof of the claim (an array of hashes, depending on tree depth) |

