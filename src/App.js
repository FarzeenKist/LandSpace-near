import React, { useEffect, useCallback, useState } from "react";
import { Container, Nav } from "react-bootstrap";
import { login, logout as destroy, accountBalance } from "./utils/near";
import Wallet from "./components/Wallet";
import { Notification } from "./components/utils/Notifications";
import Lands from "./components/marketplace/Lands";
import Cover from "./components/utils/Cover";
import coverImg from "./assets/img/land.jpg";
import "./App.css";

const App = function AppWrapper() {
  const account = window.walletConnection.account();

  const [balance, setBalance] = useState("0");

  const getBalance = useCallback(async () => {
    if (account.accountId) {
      setBalance(await accountBalance());
    }
  }, [account.accountId]);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  return (
    <>
      <Notification />
      {account.accountId ? (
        <Container fluid="md">
          <Nav className="justify-content-end pt-3 pb-5">
            <Nav.Item>
              <Wallet
                address={account.accountId}
                amount={balance}
                symbol="NEAR"
                destroy={destroy}
              />
            </Nav.Item>
          </Nav>
          <main>
            <Lands accountId={account.accountId} />
          </main>
        </Container>
      ) : (
        <Cover name="LandSpace" login={login} coverImg={coverImg} />
      )}
    </>
  );
};

export default App;
