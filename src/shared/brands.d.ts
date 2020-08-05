declare class Branded<Brand> {
    private static readonly brand: unique symbol;
    private readonly [Branded.brand]: Brand;
}

export type TransactionId = number & Branded<'transaction-id'>;
export type Dollars = number & Branded<'$'>;
export type Hexadecimal = string & Branded<'hexadecimal'>;
export type EncodedImage = string & Branded<'image-encoded'>;
export type Milliseconds = number & Branded<'ms'>;
