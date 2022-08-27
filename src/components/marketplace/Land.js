import React, { useState } from "react";
import PropTypes from "prop-types";
import { utils } from "near-api-js";
import { Card, Button, Col, Badge, Stack, Form } from "react-bootstrap";

const Land = ({ land, buy, bid, accountId, endAuction }) => {
	const {
		id,
		name,
		description,
		sold,
		location,
		image,
		owner,
		endAt,
		startingPrice,
		instantPrice,
		currentBid,
		bidder,
	} = land;

	const [newBid, setNewBid] = useState(0);
	const triggerBuy = () => {
		buy(id, instantPrice);
	};
	const triggerBid = () => {
		bid(id, newBid);
	};

	const triggerEndAuction = () => {
		endAuction(id);
	}
	// endAt is converted into milliseconds then divided into seconds into hours
	const endsInHours = Math.ceil(((endAt / 1000000) - new Date()) / 1000 / 3600) ;

	return (
		<Col key={id}>
			<Card className=" h-100">
				<Card.Header>
					<Stack direction="horizontal" gap={2}>
						<span className="font-monospace text-secondary">
							{owner}
						</span>
						<Badge bg="secondary" className="ms-auto">
							{sold ? "Not Available" : "Available"}
						</Badge>
					</Stack>
				</Card.Header>
				<div className=" ratio ratio-4x3">
					<img
						src={image}
						alt={name}
						style={{ objectFit: "cover" }}
					/>
				</div>
				<Card.Body className="d-flex  flex-column text-center">
					<Card.Title>{name}</Card.Title>
					<Card.Text className="flex-grow-1 ">
						{description}
					</Card.Text>
					<Card.Text className="text-secondary">
						<span>
							startingPrice is{" "}
							{utils.format.formatNearAmount(startingPrice)} NEAR
						</span>
						<br></br>
						<i className="bi bi-geo-alt-fill">{location}</i>
					</Card.Text>
					{!sold && new Date() < endAt && accountId !== owner ? (
						<>
							<Form.Group className="mb-3" controlId="BidAmount">
								<Form.Label>
									Enter Bid(current bid is{" "}
									{utils.format.formatNearAmount(currentBid)}{" "}
									NEAR) by {bidder}
								</Form.Label>
								<Form.Control
									type="text"
									placeholder="Enter bid amount"
									value={newBid}
									onChange={(e) => setNewBid(e.target.value)}
								/>
								<Button
									variant="outline-success"
									onClick={triggerBid}
									className="mt-2 px-5"
								>
									Bid(ends in {endsInHours}hours)
								</Button>
							</Form.Group>
							<Button
								variant="outline-dark"
								onClick={triggerBuy}
								className="w-100 py-3"
							>
								Buy Instantly for{" "}
								{utils.format.formatNearAmount(instantPrice)}{" "}
								NEAR
							</Button>
						</>
					) : (
						""
					)}
					{accountId === owner && !sold? (
						<Button variant="danger" onClick={triggerEndAuction}>End Auction</Button>
					): ""}
				</Card.Body>
			</Card>
		</Col>
	);
};

Land.propTypes = {
	land: PropTypes.instanceOf(Object).isRequired,
	buy: PropTypes.func.isRequired,
	bid: PropTypes.func.isRequired,
	endAuction: PropTypes.func.isRequired,
};

export default Land;
