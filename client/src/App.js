
import './App.css';
import { Jumbotron, Button, Nav, Navbar, Form, FormControl } from 'react-bootstrap';
import { useState } from 'react';
import Axios from 'axios';



function App() {


  let [userEmail, setUserEmail] = useState(null);
  let [password, setPassword] = useState(null);
  let [userPos, setUserPos] = useState(null);

  let [loginModal, setLoginModal] = useState(false);
  let [registerModal, setRegisterModal] = useState(false);

  let [loginPass, setLoginPass] = useState(false);


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

        setLoginModal(response.data.LoginStatus);
        console.log(response.data.LoginStatus);
        // response.data.loginStatus
        //여기에 로그인 성공하면 로그아웃 버튼 만들기
        
      })
      .catch(() => {
        //로그인 실패시 다시 로그인페이지 돌려주기
        
        alert("login failed");
      })



  }





  return (
    <div className="App">
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="/">붘미</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link onClick={() => { setLoginModal(!loginModal); setRegisterModal(false) }}>로그인</Nav.Link>

        </Nav>
        <Form inline>
          <FormControl type="text" placeholder="Search" className="mr-sm-2" />
          <Button variant="outline-info">Search</Button>
        </Form>
      </Navbar>
      <br />
      { loginPass==true?
         <Jumbotron>
        <h1>붘미</h1>
         <p>
          예약 사이트 북미
          </p>
          <p>
          <Button variant="primary">Learn more</Button>
        </p>
        </Jumbotron>
        :<LoginModal
        setRegisterModal={setRegisterModal}
        setLoginModal={setLoginModal}
        setUserEmail={setUserEmail}
        setUserPos={setUserPos}
        setPassword={setPassword}
        loginUser={loginUser}
      >
      </LoginModal>
      }
      
      {
        registerModal == true ||loginPass ==false?
          <RegisterModal
            registerUser={registerUser}

            setLoginModal={setLoginModal}
            setUserEmail={setUserEmail}
            setUserPos={setUserPos}
            setPassword={setPassword}

          >
          </RegisterModal>
          : null


      }

      {
        (loginModal == true )? //로그인버튼 누르거나|| 로그인 실패하거나
          <LoginModal
            setRegisterModal={setRegisterModal}
            setLoginModal={setLoginModal}
            setUserEmail={setUserEmail}
            setUserPos={setUserPos}
            setPassword={setPassword}
            loginUser={loginUser}
          >
          </LoginModal>
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
      <Button variant="primary" onClick={() => { props.registerUser() }}>회원가입
        </Button>
    </div>
  )
}


function LoginModal(props) {
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
      <Button variant="primary" onClick={() => {
        props.loginUser();
      }}>로그인</Button>
      <Button variant="primary" onClick={() => {
        props.setLoginModal(false); props.setRegisterModal(true)
      }}>회원가입
        </Button>
    </div>
  )
}





export default App;
