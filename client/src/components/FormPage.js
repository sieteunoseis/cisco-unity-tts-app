import React, { Component } from "react";
import {
  MDBCard,
  MDBCol,
  MDBRow,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
} from "mdbreact";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";

const createOption = (label, status) => ({
  label,
  value: label.toLowerCase().replace(/\W/g, ""),
  status,
});

const defaultOptions = [
  createOption("Alternate", "existing"),
  createOption("Busy", "existing"),
  createOption("Error", "existing"),
  createOption("Internal", "existing"),
  createOption("Closed", "existing"),
  createOption("Standard", "existing"),
  createOption("Holiday", "existing"),
];

export default class Form extends Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  state = {
    isLoading: false,
    options: defaultOptions,
    value: undefined,
    isLoggedIn: true,
    apiResponse: "",
    chOptions: "",
    chValue: "",
    gOptions: defaultOptions,
    gValue: "",
    textValue: "",
  };

  componentDidMount() {
    this.callApi()
      .then((res) => console.log(res.express))
      .catch((err) => console.log(err));
    this.getData()
      .then((res) => {
        this.setState({
          chOptions: res,
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          isLoggedIn: false,
          isLoading: true
        });
      });
  }

  getTitle = (props) => {
    const isLoggedIn = props.isLoggedIn;
    if (isLoggedIn) {
      return "Hello!";
    } else {
      return "Error retrieving data from Cisco Unity Connections!";
    }
  };

  callApi = async () => {
    const response = await fetch("/api/test");
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  getData = async () => {
    const response = await fetch("/api/callhandler/get");
    if (response.status !== 200) {
      throw new Error("API failed to connect");
    } else {
      const body = await response.json();
      return body;
    }
  };

  handleChange = (newValue, actionMeta) => {
    this.setState({ [actionMeta.name]: newValue });
  };

  handleTextBoxChange = (event) => {
    this.setState({textValue: event.target.value});
  }

  async handleSubmit(event) {
    event.preventDefault();
    const response = await fetch('/api/callhandler/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ callhandler: this.state.chValue, greeting: this.state.gValue, text: this.state.textValue }),
    });
    const body = await response.text();

    this.setState({ apiResponse: body });
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
    const {
      isLoggedIn,
      isLoading,
      chOptions,
      chValue,
      gOptions,
      gValue,
    } = this.state;
    return (
      <React.Fragment>
        <MDBRow className="justify-content-center pt-4">
          <MDBCol md="6">
            <MDBCard>
              <MDBCardBody>
                <form onSubmit={this.handleSubmit}> 
                  <p className="h4 text-center py-4">
                    <this.getTitle isLoggedIn={isLoggedIn} />
                  </p>
                  <label className="grey-text font-weight-light">
                    Select Call Handler
                  </label>
                  <CreatableSelect
                    isClearable
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    onChange={this.handleChange}
                    onCreateOption={this.handleCreate}
                    options={chOptions}
                    value={chValue}
                    name="chValue"
                    placeholder="Select or type to add new..."
                  />
                  <br />
                  <label className="grey-text font-weight-light">
                    Select Greeting
                  </label>
                  <Select
                    isClearable
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    onChange={this.handleChange}
                    options={gOptions}
                    value={gValue}
                    name="gValue"
                  />
                  <br />
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text" id="basic-addon">
                        <i className="fas fa-pencil-alt prefix"></i>
                      </span>
                    </div>
                    <textarea
                      className="form-control"
                      id="exampleFormControlTextarea1"
                      rows="5"
                      onChange={this.handleTextBoxChange}
                    ></textarea>
                  </div>
                  <div className="text-center py-4 mt-3">
                    <MDBBtn className="btn btn-outline-purple" type="submit">
                      Send
                      <MDBIcon far icon="paper-plane" className="ml-2" />
                    </MDBBtn>
                  </div>
                  <p className="h4 text-center py-4">
                    {this.state.apiResponse}
                  </p>
                </form>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </React.Fragment>
    );
  }
}
