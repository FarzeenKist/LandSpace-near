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
		const land = new Land();
		land.id = payload.id;
		land.name = payload.name;
		land.description = payload.description;
		land.image = payload.image;
		land.location = payload.location;
		land.startingPrice = payload.startingPrice;
		land.instantPrice = payload.instantPrice;
		land.currentBid = payload.currentBid;
		land.owner = context.sender;
		land.bidder = "";
		land.sold = false;
		land.endAt = context.blockTimestamp + u64(payload.endAt);
		return land;
	}

	public bid(newBid: u128): void {
		this.currentBid = newBid;
		this.bidder = context.sender;
	}

	public endAuction(): void {
		if (this.bidder.toString() != "") {
			this.owner = this.bidder;
			this.bidder = "";
			this.sold = true;
			this.currentBid = u128.Min;
		} else {
			this.sold = true;
		}
	}

	public buyLand(): void {
		this.bidder = "";
		this.owner = context.sender;
		this.sold = true;
		this.currentBid = u128.Min;
	}
}

export const landsStorage = new PersistentUnorderedMap<string, Land>(
	"LISTED_LANDS"
);

export const userLandsStorage = new PersistentUnorderedMap<string, string[]>(
	"LUL"
);
