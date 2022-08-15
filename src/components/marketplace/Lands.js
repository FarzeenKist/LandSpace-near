import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import AddLand from "./AddLand";
import Land from "./Land";
import Loader from "../utils/Loader";
import { Row } from "react-bootstrap";

import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import {
	getLands as getLandList,
	buyLand,
	bid,
	createLand,
	endAuction,
} from "../../utils/marketplace";

const Lands = ({accountId}) => {
	const [lands, setLands] = useState([]);
	const [loading, setLoading] = useState(false);

	// function to get the list of lands
	const getLands = useCallback(async () => {
		try {
			setLoading(true);
			setLands(await getLandList());
		} catch (error) {
			console.log({ error });
		} finally {
			setLoading(false);
		}
	}, []);

	const addLand = async (data) => {
		try {
			setLoading(true);
			createLand(data).then((resp) => {
				getLands();
			});
			toast(<NotificationSuccess text="Land added successfully." />);
		} catch (error) {
			console.log({ error });
			toast(<NotificationError text="Failed to create a land." />);
		} finally {
			setLoading(false);
		}
	};

	//  function to buy a land
	const buy = async (id, instantPrice) => {
		try {
			await buyLand({
				id,
				instantPrice,
			}).then((resp) => getLands());
			toast(<NotificationSuccess text="Land has been bought successfully" />);
		} catch (error) {
			toast(<NotificationError text="Failed to purchase land." />);
		} finally {
			setLoading(false);
		}
	};

	//  function to bid on a land
	const bidOnLand = async (id, newBid) => {
		try {
			await bid({
				id,
				newBid,
			}).then((resp) => getLands());
			toast(<NotificationSuccess text="You successfully bid on land" />);
		} catch (error) {
			toast(<NotificationError text="You have failed to bid on land" />);
		} finally {
			setLoading(false);
		}
	};

	//  function to end the auction of a land
	const endLandAuction = async (id) => {
		try {
			await endAuction({
				id,
			}).then((resp) => getLands());
			toast(<NotificationSuccess text="You have successfully ended the auction" />);
		} catch (error) {
			toast(<NotificationError text="You have failed to end the auction" />);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getLands();
	}, [getLands]);

	return (
		<>
			{!loading ? (
				<>
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h1 className="fs-4 fw-bold mb-0">LandSpace</h1>
						<AddLand save={addLand} />
					</div>
					<Row
						xs={1}
						sm={2}
						lg={3}
						className="g-3  mb-5 g-xl-4 g-xxl-5"
					>
						{lands.map((_land) => (
							<Land
								land={{
									..._land,
								}}
								buy={buy}
								bid={bidOnLand}
								endAuction={endLandAuction}
								accountId={accountId}
							/>
						))}
					</Row>
				</>
			) : (
				<Loader />
			)}
		</>
	);
};

export default Lands;
