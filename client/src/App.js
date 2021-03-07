
import './App.css';
import { Jumbotron, Button, Nav, Navbar, Form, FormControl } from 'react-bootstrap';
import { useState } from 'react';
import Axios from 'axios';

function App() {


  let [userEmail, setUserEmail] = useState(null);
  let [password, setPassword] = useState(null);
  let [userPos, setUserPos] = useState(null);

  let [login, setLogin] = useState(false);
  let [register, setRegister] = useState(false);


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
      password: password,
    }).then((response) => {
      alert(response.data);
      // response.data.loginStatus == false
    });
  };




  return (
    <div className="App">
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="/">붘미</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link onClick={() => { setLogin(!login) ;setRegister(false) }}>로그인</Nav.Link>

        </Nav>
        <Form inline>
          <FormControl type="text" placeholder="Search" className="mr-sm-2" />
          <Button variant="outline-info">Search</Button>
        </Form>
      </Navbar>
      <br />

      <Jumbotron>
        <h1>붘미</h1>
        <p>
          예약 사이트 북미
        </p>
        <p>
          <Button variant="primary">Learn more</Button>
        </p>
      </Jumbotron>
      {
        register == true ?
          <RegisterModal
           registerUser ={registerUser}

           setLogin ={setLogin}
           setUserEmail={setUserEmail}
           setUserPos={setUserPos}
           setPassword={setPassword}

           >
          </RegisterModal>
          : null


      }

      {
        login == true ?
          <Login
          setRegister={setRegister}
          setLogin={setLogin}
          setUserEmail={setUserEmail}
          setUserPos={setUserPos}
          setPassword={setPassword}
          >
          </Login>
          : null

      }


    </div>
  );
}
function RegisterModal(props) {
  return (

    <div className="register-page">

      <h3>회원유형 :</h3>

      <h3 onChange={event => { props.setUserPos(event.target.value) }}>
        <input type="radio" value="사업회원" name="userPos" /><span>사업회원</span>
        <input type="radio" value="일반회원" name="userPos" /><span>일반회원</span>
      </h3>
      <h3>이메일 :
       <h3>  <input type="email" onChange={event => {
          props.setUserEmail(event.target.value)
        }} /></h3>
      </h3>


      <h3>비밀번호 :
      <h3>  <input type="password" onChange={event => {
          props.setPassword(event.target.value)
        }} /></h3>
      </h3>
      <Button variant="primary" onClick={() => {props.registerUser() }}>회원가입
        </Button>
    </div>
  )
}


function Login(props) {
  return (

    <div className="login-page">
      <h3>이메일 : </h3>
      <h3> <input type="email" onChange={event => {
        props.setUserEmail(event.target.value)
      }} />
      </h3>
      <h3>비밀번호 :</h3>
      <h3> <input type="password" onChange={event => {
        props.setPassword(event.target.value)
      }} />
      </h3>
      <Button variant="primary" >로그인</Button>
      <Button variant="primary" onClick={() => {props.setLogin(false);props.setRegister(true) }}>회원가입
        </Button>
    </div>
  )
}





export default App;
