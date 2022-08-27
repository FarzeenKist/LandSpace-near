import { PersistentUnorderedMap, context, u128 } from "near-sdk-as";

/**
 * This class represents a product that can be listed on a marketplace.
 * It contains basic properties that are needed to define a product.
 * The price of the product is of type u128 that allows storing it in yocto-NEAR, where `1 yocto = 1^-24`.
 * {@link nearBindgen} - it's a decorator that makes this class serializable so it can be persisted on the blockchain level.
 */
@nearBindgen
export class Land {
	id: string;
	name: string;
	description: string;
	image: string;
	location: string;
	startingPrice: u128;
	instantPrice: u128;
	currentBid: u128;
	owner: string;
	bidder: string;
	sold: boolean;
	endAt: u64;

	public static createLand(payload: Land): Land {
		const product = new Land();
		product.id = payload.id;
		product.name = payload.name;
		product.description = payload.description;
		product.image = payload.image;
		product.location = payload.location;
		product.startingPrice = payload.startingPrice;
		product.instantPrice = payload.instantPrice;
		product.currentBid = payload.currentBid;
		product.owner = context.sender;
		product.bidder = "";
		product.sold = false;
		product.endAt = context.blockTimestamp + u64(payload.endAt);
		return product;
	}

	public bid(newBid: u128): void {
		this.currentBid = newBid;
		this.bidder = context.sender;
	}

	public endAuction(): string {
		if (this.bidder.toString() != "") {
			this.owner = this.bidder;
			this.bidder = "";
			this.sold = true;
			return this.owner;
		} else {
			this.sold = true;
			return "";
		}
	}

	public buyLand(): void {
		this.bidder = "";
		this.owner = context.sender;
		this.sold = true;
	}
}

export const landsStorage = new PersistentUnorderedMap<string, Land>(
	"LISTED_LANDS"
);
