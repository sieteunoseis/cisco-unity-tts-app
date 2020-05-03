import React, { Component } from 'react';
import {
  Container, Col, Row, Form,
  FormGroup, Label,
  Button
} from 'reactstrap';
import Select from 'react-select';
import logo from './logo.png';
import CreatableSelect from 'react-select/creatable';
import './App.css';

const createOption = (label,status) => ({
  label,
  value: label.toLowerCase().replace(/\W/g, ''),
  status
});

const defaultOptions = [
  createOption('Alternate','existing'),
  createOption('Busy','existing'),
  createOption('Error','existing'),
  createOption('Internal','existing'),
  createOption('Closed','existing'),
  createOption('Standard','existing'),
  createOption('Holiday','existing'),
];

class App extends Component {
  state = {
    response: '',
    post: '',
    responseToPost: '',
    isLoading: false,
    chOptions: '',
    chValue: '',
    gOptions: defaultOptions,
    gValue: '',
    textValue: ''
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
    this.getData()
      .then(res => {
        this.setState({
            chOptions: res
        });
      })
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/api/test');
    const body = await response.json();
  
    if (response.status !== 200) throw Error(body.message);

    return body;
  };
  
  getData = async () => {
    const response = await fetch('/api/callhandler/get');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  handleSubmit = async e => {
    e.preventDefault();
    const response = await fetch('/api/callhandler/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ callhandler: this.state.chValue, greeting: this.state.gValue, text: this.state.textValue }),
    });
    const body = await response.text();

    this.setState({ responseToPost: body });
  };

  handleChange = (newValue, actionMeta) => {
    this.setState({ [actionMeta.name]: newValue });
  };

  handleTextBoxChange = (event) => {
    this.setState({textValue: event.target.value});
  }

  handleCreate = (inputValue) => {
    this.setState({ isLoading: true });
    setTimeout(() => {
      const { chOptions } = this.state;
      const newOption = createOption(inputValue,'new');
      this.setState({
        isLoading: false,
        chOptions: [...chOptions, newOption],
        chValue: newOption,
      });
    }, 1000);
  };

  render() {
    const { isLoading, chOptions, chValue, gOptions, gValue } = this.state;
    return (
        <Container className="App">
          <Row>
            <Col><img src={logo} className="App-logo" alt="logo" /></Col>
          </Row>
          <Form className="form">
              <FormGroup>
                <Label for="textInput">Greeting Name</Label>
                <CreatableSelect
                  isClearable
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  onChange={this.handleChange}
                  onCreateOption={this.handleCreate}
                  options={chOptions}
                  value={chValue}
                  name='chValue'
                  placeholder='Select or type to add new...'
                />
              </FormGroup>
              <FormGroup>
              <Label for="textInput">Greeting</Label>
              <Select
                isClearable
                isDisabled={isLoading}
                isLoading={isLoading}
                onChange={this.handleChange}
                options={gOptions}
                value={gValue}
                name='gValue'
              />
              </FormGroup>
              <FormGroup>
                <Label for="textInput">Text</Label>
                <textarea name="Text" onChange={this.handleTextBoxChange} id="textInput" className="textarea"/>
              </FormGroup>
            <Button onClick={e => {e.preventDefault(); this.handleSubmit(e)}}>Submit</Button>
          </Form>
          <p>{this.state.responseToPost}</p>
        </Container>
    );
  }
}

export default App;
