import { v4 as uuid4 } from "uuid";
import { parseNearAmount } from "near-api-js/lib/utils/format";

const GAS = 100000000000000;
//block.timestamp is recorded in nanoseconds for NEAR
const nanosecond = 1000000000;
export function createLand(land) {
  land.id = uuid4();
  land.endAt = String(land.endAt * 24 * 3600 * nanosecond); 
  land.startingPrice = parseNearAmount(land.startingPrice + "");
  land.instantPrice = parseNearAmount(land.instantPrice + "");
  land.currentBid = parseNearAmount(0 + "");
  return window.contract.setLand({ land });
}

export function getLands() {
  return window.contract.getLands();
}

export async function buyLand({ id, instantPrice }) {
  await window.contract.buyLand({ landId: id }, GAS, instantPrice);
}

export async function bid({ id, newBid }) {
  newBid = parseNearAmount(newBid + "");
  await window.contract.bid({ landId: id, newBid }, GAS, newBid);
}


export async function endAuction({ id }) {
  await window.contract.endAuction({ landId: id}, GAS);
}