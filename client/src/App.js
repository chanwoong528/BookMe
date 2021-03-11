
import './App.css';
import { Jumbotron, Button, Nav, Navbar, Form, FormControl, Modal } from 'react-bootstrap';
import { useState } from 'react';
import Axios from 'axios';
import { HashRouter as Router, Route, Switch } from "react-router-dom"


function App() {


  let [userEmail, setUserEmail] = useState(null);
  let [password, setPassword] = useState(null);
  let [userPos, setUserPos] = useState(null);

  let [loginModal, setLoginModal] = useState(false);
  let [registerModal, setRegisterModal] = useState(false);


  const [loggedIn, setLoggedIn] = useState(false);


  const registerUser = () => {
    Axios.post(`http://localhost:3001/users/new`, {

      userPos: userPos,
      userEmail: userEmail,
      password: password,
    }).then((response) => {
      alert(response.data);
    });
  };

  const loginUser = () => {
    Axios.post(`http://localhost:3001/users/login`, {
      userEmail: userEmail,
      password: password
    })
      .then((response) => {

        setLoginModal(!response.data.loginStatus);
        setLoggedIn(response.data.loginStatus);
        
        alert(response.data.loginStatus);
        console.log("loggedin :"+loggedIn)

        // response.data.loginStatus
        //여기에 로그인 성공하면 로그아웃 버튼 만들기

      })
      .catch(() => {
        //로그인 실패시 다시 로그인페이지 돌려주기

        alert("login failed");
      })
  }
  const logoutUser =( )=> {
    Axios.get(`http://localhost:3001/users/logout`, {


    }).then((response)=>{
      setLoggedIn(false);
      alert(response.data.loginStatus);
    })

  }





  return (
    <div className="App">
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="/">붘미</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link onClick={() => {
            setLoginModal(!loginModal); setRegisterModal(false) }}>
           {loggedIn? null:<>로그인</> } </Nav.Link>
           <Nav.Link onClick={() => {logoutUser()}}>
           {loggedIn? <>로그아웃</>:null } </Nav.Link>
        </Nav>
        
      </Navbar>
      <br />
        {
          loggedIn?
          <Jumbotron>
          <h1>붘미</h1>
          <p>
            예약 사이트 북미
          </p>
          <p>
            <Button variant="primary">Learn more</Button>
          </p>
        </Jumbotron>
        :<LoginModal>

        </LoginModal>
        


        }
       
        
     
        {
          loginModal == true? //로그인버튼 누르거나|| 로그인 실패하거나
          <LoginModal
            setRegisterModal={setRegisterModal}
            setLoginModal={setLoginModal}
            setUserEmail={setUserEmail}
            setUserPos={setUserPos}
            setPassword={setPassword}
            loginUser={loginUser}
            show={loginModal}
            onHide={() => setLoginModal(false)}
         >
          </LoginModal>
          : null

      }

      {
        registerModal == true ?
          <RegisterModal
            registerUser={registerUser}

            setLoginModal={setLoginModal}
            setUserEmail={setUserEmail}
            setUserPos={setUserPos}
            setPassword={setPassword}
            show={registerModal}
            onHide={() => setRegisterModal(false)}
          >
          </RegisterModal>
          : null


      }

      


    </div>
  );
}


function RegisterModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <h1>회원가입</h1>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h3>회원유형 </h3>

        <h3 onChange={event => { props.setUserPos(event.target.value) }}>
          <input type="radio" value="사업회원" name="userPos" /><span>사업회원</span>
          <input type="radio" value="일반회원" name="userPos" /><span>일반회원</span>
        </h3>
        <h3>이메일 </h3>
        <h3><input type="email" onChange={event => {
          props.setUserEmail(event.target.value)
        }} />

        </h3>


        <h3>비밀번호<h3>
          <input type="password" onChange={event => {
            props.setPassword(event.target.value)
          }} /></h3>
        </h3>
      </Modal.Body>



      <Modal.Footer>
        <Button variant="primary" onClick={() => { props.registerUser() }}>회원가입
        </Button>
        <Button variant="secondary" onClick={props.onHide}>Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function LoginModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <h1>로그인</h1>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        
          <h3>이메일</h3>
          <h3> <input type="email" onChange={event => {
            props.setUserEmail(event.target.value)
          }} />
          </h3>
          <h3>비밀번호</h3>
          <h3> <input type="password" onChange={event => {
            props.setPassword(event.target.value)
          }} />
          </h3>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => {
          props.loginUser();
        }}>로그인
          </Button>
        <Button variant="primary" onClick={() => {
          props.setLoginModal(false); props.setRegisterModal(true)
        }}>회원가입
        </Button>


        <Button variant="secondary" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}






export default App;
