import { Land, landsStorage, userLandsStorage } from "./model";
import { context, ContractPromiseBatch, u128 } from "near-sdk-as";

/**
 *
 * This function changes the state of data in the blockchain.
 * It is used to issue buy transactions when a land is purchased from a given seller,
 *  (if the land is available) with the instant selling price
 *
 * @param landId - an identifier of a land that is the subject of purchase
 */
export function buyLand(landId: string): void {
	const land = getLand(landId);
	if (land == null) {
		throw new Error("Land not found");
	}
	if (land.instantPrice.toString() != context.attachedDeposit.toString()) {
		throw new Error(
			"attached deposit should be equal to the land's price"
		);
	}
	/*
        `ContractPromiseBatch` is used here to create a transaction to transfer the money to the seller
        The amount of money to be used in the transaction is taken from `context.attachedDeposit` 
        which is defined by `--depositYocto=${AMOUNT}` parameter during the invocation 
    */
	if (land.bidder.toString() != "") {
		ContractPromiseBatch.create(land.bidder).transfer(land.currentBid);
	}
	ContractPromiseBatch.create(land.owner).transfer(context.attachedDeposit);
	land.buyLand();
	landsStorage.set(land.id, land);

	let userLands = userLandsStorage.get(context.sender);
	if(userLands == null){
		userLands = [];
	}

	userLands.push(landId);
	userLandsStorage.set(context.sender, userLands);
}

/**
 *
 * This function changes the state of data in the blockchain.
 * It is used to issue new bids transactions on a land(if the land is available)
 *
 * @param landId - an identifier of a land that is the subject of purchase
 */
export function bid(landId: string, newBid: u128): void {
	const land = getLand(landId);
	if (land == null) {
		throw new Error("Land not found");
	}
	assert(context.sender.toString() != land.owner, "You can't bid on your own land");
	assert(land.sold == false, "Land is already sold");
	assert(
		u128.gt(newBid,land.currentBid) && u128.ge(newBid,land.startingPrice),
		"New bid must be greater than current bid"
	);
	assert(context.sender.toString() != land.bidder, "You can't outbid yourself");
	assert(context.blockTimestamp <= land.endAt, "Auction is over");
	assert(
		newBid.toString() == context.attachedDeposit.toString(),
		"Attached deposit needs to match the new bid amount"
	);
	if (land.bidder.toString() != "") {
		ContractPromiseBatch.create(land.bidder).transfer(land.currentBid);
	}
	land.bid(newBid);
	if (land.currentBid >= land.instantPrice){
		ContractPromiseBatch.create(land.owner).transfer(land.currentBid);
		land.endAuction();

		let userLands = userLandsStorage.get(context.sender);
		if(userLands == null){
			userLands = [];
		}

		userLands.push(landId);
		userLandsStorage.set(context.sender, userLands);
	}
	landsStorage.set(land.id, land);
}

/**
 *
 * This function changes the state of data in the blockchain.
 * It is used to end an auction on a landId(if land is still on auction)
 *
 * @param landId - an identifier of a land that is the subject of purchase
 */
export function endAuction(landId: string): void {
	const land = getLand(landId);
	if (land == null) {
		throw new Error("Land not found");
	}
	assert(context.sender.toString() == land.owner, "Only the owner can end the auction");
	assert(land.sold == false, "Land is already sold");
	assert(context.blockTimestamp >= land.endAt, "Auction isn't over");
	if (land.bidder.toString() != "") {
		ContractPromiseBatch.create(land.owner).transfer(land.currentBid);

		let userLands = userLandsStorage.get(land.bidder);
		if(userLands == null){
			userLands = [];
		}

		userLands.push(landId);
		userLandsStorage.set(land.bidder, userLands);
	}
	land.endAuction();
	landsStorage.set(land.id, land);
}

/**
 * Adding a new land to the contract
 * @param land - a land to be added to the blockchain
 */
export function setLand(land: Land): void {
	let storedLand = landsStorage.get(land.id);
	if (storedLand != null) {
		throw new Error(`a land with id=${land.id} already exists`);
	}

	if(land.name.length < 3){
		throw new Error("Land name is required")
	}
	if(land.location.length < 3){
		throw new Error("Land location is required")
	}
	if(land.startingPrice < u128.Min){
		throw new Error("Land starting price is required")
	}
	if(land.instantPrice < u128.Min){
		throw new Error("Land instant price is required")
	}

	landsStorage.set(land.id, Land.createLand(land));
}

/**
 *
 * A function that returns a single land for given owner and product id
 *
 * @param id - an identifier of a land to be returned
 * @returns a land for a given @param id
 */
export function getLand(id: string): Land | null {
	return landsStorage.get(id);
}

/**
 *
 * A function that returns an array of lands for all accounts
 *
 * @returns an array of objects that represent lands
 */
export function getLands(): Array<Land> {
	return landsStorage.values();
}

/**
 *
 * A function that returns an array of lands bought by given user
 *
 * @returns an array of objects that represent lands
 */
export function getUserLands(accountId: string): Array<Land> {

	if(accountId.length < 3){
		throw new Error("Account ID is required");
	}

	let userLandsIDs = userLandsStorage.get(accountId);

	let userLands : Land[] = [];

	for(let i=0; i<userLandsIDs.length; i++){
		if(landsStorage.contains(userLandsIDs[i])){
			userLands.push(landsStorage.getSome(userLandsIDs[i]));
		}
	}
	return userLands;
}
