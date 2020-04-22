import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import VerifiableCredential from "@docknetwork/sdk/src/verifiable-credential";
import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import {generateEcdsaSecp256k1Keypair, getPublicKeyFromKeyringPair} from "@docknetwork/sdk/src/utils/misc";
class App extends Component{
  constructor(props) {
    super(props);
    this.state = {
      logging: "",
      vc: new VerifiableCredential(`https://example.com/credentials/${Math.random().toString(36).substr(2, 9)}`),
    };

    this.handler = this.handler.bind(this)
  }

  handler(contents) {
    this.setState(contents)
  }
  render() {
    return (
      <div className="App">
        <Container>
        <Jumbotron>
          <header className="App-header">
          <h1 className="header">Verifiable Credentials Demo</h1>
            <Row>
              <Col>
                <Card>
                  <Card.Header>Available Methods</Card.Header>
                  <ListGroup variant="flush">
                  <ListGroup.Item><TextForm vc={this.state.vc} funcName="addContext" handler={this.handler} /></ListGroup.Item>
                  <ListGroup.Item><TextForm vc={this.state.vc} funcName="addType" handler={this.handler} /></ListGroup.Item>
                  <ListGroup.Item><TextForm vc={this.state.vc} funcName="addSubject" handler={this.handler} /></ListGroup.Item>
                  <ListGroup.Item><TextForm vc={this.state.vc} funcName="setStatus" handler={this.handler} /></ListGroup.Item>
                  <ListGroup.Item><TextForm vc={this.state.vc} funcName="setIssuanceDate" handler={this.handler} /></ListGroup.Item>
                  <ListGroup.Item><TextForm vc={this.state.vc} funcName="setExpirationDate" handler={this.handler} /></ListGroup.Item>
                  <ListGroup.Item><KeyForm vc={this.state.vc} funcName="sign" handler={this.handler}/></ListGroup.Item>
                  </ListGroup>
                </Card>
              </Col>
              <Col>
                <Card>
                  <Card.Header>Output</Card.Header>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Form>
                        <Form.Label>Verifiable Credential</Form.Label>
                        <Form.Control as="textarea" value={JSON.stringify(this.state.vc, null, 1)} rows="15"/>
                      </Form>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Form>
                        <Form.Label>Error Log</Form.Label>
                        <Form.Control as="textarea" value={JSON.stringify(this.state.logging, null, 1)} style={{color: "red"}} rows="5"/>
                      </Form>
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </Col>
            </Row>
          </header>
        </Jumbotron>
        </Container>
      </div>
    );
    }

}

export default App;


function getSampleKey() {
  const keypair = generateEcdsaSecp256k1Keypair('issuer', 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
  return {
    id: 'https://gist.githubusercontent.com/lovesh/67bdfd354cfaf4fb853df4d6713f4610/raw',
    controller: 'https://gist.githubusercontent.com/lovesh/312d407e3a16be0e7d5e43169e824958/raw',
    type: 'EcdsaSecp256k1VerificationKey2019',
    keypair: keypair,
    publicKey: getPublicKeyFromKeyringPair(keypair)
  };
}

class TextForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vc: this.props.vc,
      value: '',
      funcName: this.props.funcName,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault()
      try {
        let valueToUse = this.state.value.toString()
        if (valueToUse.startsWith('{')){
          valueToUse = JSON.parse(valueToUse)
        }
        this.props.handler(
          {
            vc: this.state.vc[this.state.funcName](valueToUse),
            logging: ""
          }
        )
      } catch (e) {
        this.props.handler({logging: e.toString()})
        console.log(e)
      }
  }
  render() {
    return (
        <Form inline onSubmit={this.handleSubmit}>
          <Form.Group controlId={this.props.funcName}>
          <Form.Control type="text" value={this.state.value} onChange={this.handleChange}/>
          <Button type="submit" >{this.props.funcName}</Button>
          </Form.Group>
        </Form>
    );
  }
}

class KeyForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vc: this.props.vc,
      value: getSampleKey(),
      funcName: this.props.funcName,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  async handleSubmit(event) {
    event.preventDefault()
      try {
        let valueToUse = this.state.value
        this.props.handler(
          {
            vc: await this.state.vc[this.state.funcName](valueToUse),
            logging: ""
          }
        )
      } catch (e) {
        this.props.handler({logging: e.toString()})
        console.log(e)
      }
  }
  render() {
    return (
        <Form onSubmit={this.handleSubmit}>
          <Form.Group controlId={this.props.funcName}>
          <Form.Label>Signing Key</Form.Label>
          <Form.Control type="text" value={JSON.stringify(this.state.value, null, 1)} as="textarea" rows={15}/>
          <Button type="submit" variant="success" >{this.props.funcName}</Button>
          </Form.Group>
        </Form>
    );
  }
}
