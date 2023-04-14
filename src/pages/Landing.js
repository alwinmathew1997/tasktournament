/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";

import {
  Container,
  Navbar,
  Button,
  Row,
  Col,
  Tabs,
  Tab,
  Card,
  InputGroup,
  Form,
  Modal,
} from "react-bootstrap/";
import moment from "moment";
import { toast } from "react-toastify";
import Web3 from "web3";
import "@metamask/legacy-web3";

import config from "../lib/config";
import CON_ABI from "../Abi/tokenabi.json";

// toast.configure()
let toasterOption = config.toasterOption;
let contract_add = config.Contract_Add;
let web3;
let SMART_CONTRACT;

function Landing() {
  const [UserAccountAddr, setUserAccountAddr] = useState("");
  const [WalletConnected, setWalletConnected] = useState(false);
  const [UserAccountBal, setUserAccountBal] = useState(0);
  const [Accounts, Set_Accounts] = useState("");
  const [ButtonLoader, set_ButtonLoader] = useState(false);

  const [Activegames, Set_Activegames] = useState([]);
  const [Allgames, Set_Allgames] = useState([]);
  const [Leaderboard, Set_Leaderboard] = useState([]);

  const [NoOfplayers, set_NoOfplayers] = useState(0);
  const [Winningscore, set_Winningscore] = useState(0);
  const [duration, set_duration] = useState(0);

  const [UserScore, set_UserScore] = useState(0);

  const [SelID, set_SelID] = useState(0);

  const [show, setShow] = useState(false);
  const [leadshow, setleadshow] = useState(false);

  const handleClose = () => setShow(false);

    const Handlelead = () => setleadshow(false);

  useEffect(() => {
    CheckConnected();
  }, []);

  async function handleShow(id) {
    setShow(true);
    set_SelID(id);
  }
  useEffect(() => {
    GetData();
  }, [WalletConnected]);

  async function CheckConnected() {
    if (localStorage.getItem("Walletconnected")) {
      await window.ethereum
        .enable()
        .then(async function () {
          web3 = new Web3(window.web3.currentProvider);

          if (
            window.web3.currentProvider.networkVersion === config.networkVersion
          ) {
            if (window.web3.currentProvider.isMetaMask === true) {
              if (
                window.web3 &&
                window.web3.eth &&
                window.web3.eth.defaultAccount
              ) {
                var currAddr = window.web3.eth.defaultAccount;
                // console.log("🚀 ~ file: Landing.js:68 ~ currAddr:", currAddr);
                setUserAccountAddr(currAddr);
                setWalletConnected(true);
                var result = await web3.eth.getAccounts();
                var setacc = result[0];
                Set_Accounts(setacc);
                localStorage.setItem("Walletconnected", true);
                await web3.eth.getBalance(setacc).then(async (val) => {
                  var balance = val / config.decimalvalues;
                  setUserAccountBal(balance);
                });
              }
            }
          }
        })
        .catch((e) => {});
    }
  }

  async function ConnectWallet() {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      try {
        if (typeof web3 !== "undefined") {
          // const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          await window.ethereum
            .enable()
            .then(async function () {
              const web3 = new Web3(window.web3.currentProvider);
              if (
                window.web3.currentProvider.networkVersion ===
                config.networkVersion
              ) {
                if (window.web3.currentProvider.isMetaMask === true) {
                  if (
                    window.web3 &&
                    window.web3.eth &&
                    window.web3.eth.defaultAccount
                  ) {
                    var currAddr = window.web3.eth.defaultAccount;
                    // console.log(
                    //   "🚀 ~ file: Landing.js:107 ~ currAddr:",
                    //   currAddr
                    // );
                    setUserAccountAddr(currAddr);

                    setWalletConnected(true);
                    var result = await web3.eth.getAccounts();
                    var setacc = result[0];
                    Set_Accounts(setacc);
                    localStorage.setItem("Walletconnected", true);
                    web3.eth.getBalance(setacc).then((val) => {
                      var balance = val / config.decimalvalues;
                      setUserAccountBal(balance);
                    });
                    window.location.reload(false);
                  }
                }
              } else {
                setWalletConnected(false);
                toast.warning(
                  "Please Connect With Polygon Network",
                  toasterOption
                );
              }
            })
            .catch((e) => {});
        } else {
          setWalletConnected(false);
          toast.warning("Please Add Metamask External", toasterOption);
        }
      } catch (err) {
        setWalletConnected(false);
      }
    } else {
      setWalletConnected(false);
      toast.warning("Please Add Metamask External", toasterOption);
    }
  }

  async function GetData() {
    try {
      web3 = new Web3(window.ethereum);
      SMART_CONTRACT = await new web3.eth.Contract(CON_ABI, contract_add);
      var noofgames = await SMART_CONTRACT.methods.numGames().call();

      if (noofgames > 0) {
        let allgames = [];
        let activegames = [];
        for (var i = 0; i < noofgames; i++) {
          var tempdata = await SMART_CONTRACT.methods.games(i).call();
          console.log(
            "🚀 ~ file: Landing.js:158 ~ GetData ~ tempdata:",
            tempdata
          );

          var obj = {
            gameid: i,
            endtime: tempdata.endTime,
            active: tempdata.ended,
            noofplayers: tempdata.numPlayers,
            scoretowin: tempdata.winningScore,
          };
          allgames.push(obj);
          if (!tempdata.ended) {
            activegames.push(obj);
          }
        }
        Set_Activegames(activegames);
        Set_Allgames(allgames);
      }
    } catch (err) {
      console.log("🚀 ~ file: Landing.js:143 ~ GetData ~ err:", err);
    }
  }

  const InputChange = (e) => {
    if (e && e.target && typeof e.target.value != "undefined" && e.target.id) {
      var value = e.target.value;
      switch (e.target.id) {
        case "duration":
          set_duration(value);
          break;
        case "winningscore":
          set_Winningscore(value);
          break;
        case "noofplayer":
          set_NoOfplayers(value);
          break;
        case "UserScore":
          set_UserScore(value);
          break;
        default:
      }
    }
  };

  async function CreatGame() {
    try {
      set_ButtonLoader(true);
      if (duration === "") {
        toast.warning("Please Enter the Duration", toasterOption);
        set_ButtonLoader(false);
        return false;
      }
      if (Winningscore === "") {
        toast.warning("Please Enter the Score", toasterOption);
        set_ButtonLoader(false);
        return false;
      }
      if (NoOfplayers === "") {
        toast.warning("Please Enter the No of Players!", toasterOption);
        set_ButtonLoader(false);
        return false;
      }

      if (UserAccountAddr !== "") {
        var result = await SMART_CONTRACT.methods
          .createGame(NoOfplayers, Winningscore, duration)
          .send({
            from: UserAccountAddr,
          });

        if (result) {
          set_ButtonLoader(false);
          toast.success("Game Created Successfully", toasterOption);
          window.location.reload(false);
        }
      } else {
        toast.warning("Wallet not connected!", toasterOption);
        set_ButtonLoader(false);
      }
    } catch (err) {
      set_ButtonLoader(false);
    }
  }

  async function JoinAndRegister() {
    // alert(SelID)
    set_ButtonLoader(true);
    if (UserScore === 0) {
      toast.warning("Please Enter the No!", toasterOption);
      set_ButtonLoader(false);
      return false;
    }
    try {
      var userarray = await SMART_CONTRACT.methods
        .CheckUserJoined(SelID)
        .call();
    //   console.log(
    //     "🚀 ~ file: Landing.js:271 ~ JoinAndRegister ~ userarray:",
    //     userarray
    //   );
    //   console.log(
    //     "🚀 ~ file: Landing.js:276 ~ JoinAndRegister ~ UserAccountAddr:",
    //     UserAccountAddr
    //   );

      var index = userarray.findIndex(
        (el) => el.toLowerCase() === UserAccountAddr.toLowerCase()
      );
    //   console.log(
    //     "🚀 ~ file: Landing.js:278 ~ JoinAndRegister ~ index:",
    //     index
    //   );

      if (index === -1) {
        let firstresult = await SMART_CONTRACT.methods.joinGame(SelID).send({
          from: UserAccountAddr,
        });
      }

      //   if (firstresult) {
      let secondresult = await SMART_CONTRACT.methods
        .recordScore(SelID, UserScore)
        .send({
          from: UserAccountAddr,
        });

      if (secondresult) {
        set_ButtonLoader(false);
        toast.success("Game Created Successfully", toasterOption);
        window.location.reload(false);
      }
      //   }
    } catch (err) {
      console.log("🚀 ~ file: Landing.js:291 ~ JoinAndRegister ~ err:", err);
      set_ButtonLoader(false);
      toast.warning(err, toasterOption);
    }
  }

  async function handleLeaderboard(id) {
    try {
      let winnerslist = await SMART_CONTRACT.methods.getLeaderboard(id).call();
    //   console.log(
    //     "🚀 ~ file: Landing.js:308 ~ handleLeaderboard ~ winnerslist:",
    //     winnerslist
    //   );
      var newarray = [];
      for (var i = 0; i < winnerslist.length; i++) {
        var obj = {
          UserAdd: winnerslist[i].name,
          Score: winnerslist[i].score,
        };
        newarray.push(obj);
      }
      Set_Leaderboard(newarray);
      setleadshow(true)
    } catch (error) {}
  }

  return (
    <div className="App">
      <header>
        <Navbar variant="dark">
          <Container className="pos_container">
            <Navbar.Brand>
              <h3>Tournaments</h3>
            </Navbar.Brand>

            <Navbar.Collapse className="justify-content-end connect_button">
              {!WalletConnected && (
                <Button variant="warning" onClick={ConnectWallet}>
                  Connect Wallet
                </Button>
              )}
              {WalletConnected && <Button variant="success">{Accounts}</Button>}
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <br />
        <Container>
          <Tabs
            defaultActiveKey="home"
            id="justify-tab-example"
            className="my-4"
            justify
          >
            <Tab eventKey="Create" title="Create Tournament">
              <br />
              <h3>Create a New Game </h3>

              <br />
              <InputGroup className="mb-3">
                <InputGroup.Text id="inputGroup-sizing-default">
                  No of Players
                </InputGroup.Text>
                <Form.Control
                  aria-label="Default"
                  aria-describedby="inputGroup-sizing-default"
                  type="number"
                  placeholder="Enter the No of Players"
                  id="noofplayer"
                  onChange={InputChange}
                />
              </InputGroup>

              <br />

              <InputGroup className="mb-3">
                <InputGroup.Text id="inputGroup-sizing-default">
                  Winning Score
                </InputGroup.Text>
                <Form.Control
                  aria-label="Default"
                  aria-describedby="inputGroup-sizing-default"
                  type="number"
                  placeholder="Enter the Wining Score"
                  id="winningscore"
                  onChange={InputChange}
                />
              </InputGroup>
              <br />

              <InputGroup className="mb-3">
                <InputGroup.Text id="inputGroup-sizing-default">
                  Duration
                </InputGroup.Text>
                <Form.Control
                  aria-label="Default"
                  aria-describedby="inputGroup-sizing-default"
                  type="number"
                  placeholder="Enter the Duration"
                  id="duration"
                  onChange={InputChange}
                />
              </InputGroup>
              <p>
                Duration should be in seconds (to be added with curent
                timestamp)
              </p>

              <Button
                variant="primary"
                disabled={ButtonLoader}
                onClick={CreatGame}
              >
                Create
              </Button>
            </Tab>
            <Tab eventKey="home" title="Active Tournaments">
              {Activegames.length > 0 &&
                Activegames.map((item, i) => {
                  var dateString = moment
                    .unix(item.endtime)
                    .format("DD/MM/YYYY hh:mm:ss");
                  return (
                    <Card style={{ width: "18rem" }}>
                      <Card.Body>
                        <Card.Title>
                          Winning Score - {item.scoretowin}
                        </Card.Title>
                        <Card.Text>
                          Max No of Players - {item.noofplayers}
                          <br />
                          End Time - {dateString}
                        </Card.Text>
                        <Button
                          variant="primary"
                          onClick={() => handleShow(item.gameid)}
                        >
                          Join
                        </Button>
                      </Card.Body>
                    </Card>
                  );
                })}
            </Tab>

            <>
              <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                  <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="inputGroup-sizing-default">
                        Random Number
                      </InputGroup.Text>
                      <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        type="number"
                        placeholder="Enter a Random Number"
                        id="UserScore"
                        onChange={InputChange}
                      />
                    </InputGroup>
                  </>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    disabled={ButtonLoader}
                    onClick={() => JoinAndRegister()}
                  >
                    Join
                  </Button>
                </Modal.Footer>
              </Modal>
            </>

            <Tab eventKey="longer-tab" title="All Tournaments">
              {Allgames.length > 0 &&
                Allgames.map((item, i) => {
                  return (
                    <>
                    <Card style={{ width: "18rem" }}>
                      <Card.Body>
                        <Card.Title>
                          Winning Score - {item.scoretowin}
                        </Card.Title>
                        <Card.Text>
                          Max No of Players - {item.noofplayers}
                          <br />
                          {/* End Time - {dateString}  */}
                        </Card.Text>
                        <Button
                          variant="primary"
                          onClick={() => handleLeaderboard(item.gameid)}
                        >
                          View Leaderboard
                        </Button>
                      </Card.Body>
                    </Card>
                    <br/>
                    </>
                  );
                })}
            </Tab>
            <>
              <Modal show={leadshow} onHide={Handlelead}>
                <Modal.Header closeButton>
                  <Modal.Title>Leaderboard</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <>
                  <p>User Add - Score</p>
                  {Leaderboard.length>0&& Leaderboard.map((item,i)=>{
                    return(
                        <p>{item.UserAdd} - {item.Score}</p> 
                    )
                  })}
                

                   {/* <h4></h4> */}
                  </>
                </Modal.Body>
                <Modal.Footer>
                 
                </Modal.Footer>
              </Modal>
            </>
          </Tabs>
        </Container>
      </header>
    </div>
  );
}

export default Landing;
