import React from 'react';
import axios from 'axios';
import moment from 'moment';
import shortid from 'shortid';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Link } from 'react-router-dom';
import Search from './Search';
import Timeline from './Timeline';
import TimelineInputBox from './TimelineInputBox';
import TimelineLookup from './TimelineLookUp';
import StartDateBox from './StartDateBox';
import EndDateBox from './EndDateBox';
import MapView from './MapView';


class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoggedIn: false,
      userInfo: null,
      timelineData: [],
      timelineName: '', // temp until we get some more data built up
      startDate: '',
      endDate: '',
      numberOfDays: 0,
      timelineId: '', // temp until we get a way to produce these
      newEvent: '',
      newEventAddress: '',
      today: '',
      view: 'default',
    };

    this.checkAuth = this.checkAuth.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.addNewEvent = this.addNewEvent.bind(this);
    this.getTrip = this.getTrip.bind(this);
    this.handleId = this.handleId.bind(this);
    this.handleName = this.handleName.bind(this);
    this.onLookupEnter = this.onLookupEnter.bind(this);
    this.onCreateEnter = this.onCreateEnter.bind(this);
    this.handleNewEvent = this.handleNewEvent.bind(this);
    this.handleNewAddress = this.handleNewAddress.bind(this);
    this.createEvent = this.createEvent.bind(this);
  }

  componentDidMount() {
    // on init function to make get request to server
    // temp using 1234 as the timelineId and test as timelineName
    // this.getTrip();
    this.checkAuth();
    this.setDate();
  }

  onInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  onSubmit() {
    this.setState({ timelineId: shortid.generate() }, () => {
      const start = moment(this.state.startDate);
      const end = moment(this.state.endDate);
      this.setState({ numberOfDays: end.diff(start, 'days') }, () => {
        axios.post('/timeline', {
          timelineId: this.state.timelineId,
          timelineName: this.state.timelineName,
          numberOfDays: this.state.numberOfDays,
        })
          .then(() => this.getTrip())
          .catch(err => console.error('error in submit ', err));
      });
    });
  }

  onToggleView(view) {
    this.setState({
      view,
    });
  }

  onEnter(event) {
    if (event.key === 'Enter') {
      this.onSubmit();
    }
  }

  onCreateEnter(event) {
    if (event.key === 'Enter') {
      this.createEvent();
    }
  }

  onLookupEnter(event) {
    if (event.key === 'Enter') {
      this.getTrip();
    }
  }

  setDate() {
    let today = moment().format('L').split('/');
    today = `${today[2]}-${today[0]}-${today[1]}`;
    this.setState({
      today,
    });
  }

  getTrip() {
    axios.get(`/timeline/${this.state.timelineName}/${this.state.timelineId}`)
      .then(({ data }) => {
        this.setState({
          timelineData: data,
          numberOfDays: data.length,
          timelineId: data[0].timelineId,
        });
      })
      .catch(err => console.error('Error getting trips ->', err));
  }

  checkAuth() {
    axios.get('/auth/checkAuth')
      .then(({ data }) => {
        this.setState({ isLoggedIn: data.isLoggedIn, userInfo: data.user });
      });
  }

  handleId(e) {
    this.setState({
      timelineId: e.target.value,
    });
  }

  handleName(e) {
    this.setState({
      timelineName: e.target.value,
    });
  }

  handleNewEvent(e) {
    this.setState({
      newEvent: e.target.value,
    });
  }

  handleNewAddress(e) {
    this.setState({
      newEventAddress: e.target.value,
    });
  }

  addNewEvent(event, selectedDay) {
    const day = Number(selectedDay);
    axios.post('/entry', {
      event,
      timelineId: this.state.timelineId,
      day,
      timelineName: this.state.timelineId,
    })
      .then(() => this.getTrip())
      .catch(err => console.error('add event error: ', err));
  }

  createEvent(day) {
    const eventObj = {
      name: this.state.newEvent,
      address: this.state.newEventAddress,
      votes: 0,
    };
    this.addNewEvent(eventObj, day);
  }

  renderView() {
    if (this.state.view === 'default' || this.state.view === 'calendar') {
      return (
        <Timeline
          timelineData={this.state.timelineData}
          timelineId={this.state.timelineId}
          timelineName={this.state.timelineName}
          onCreateEnter={this.onCreateEnter}
          handleNewEvent={this.handleNewEvent}
          handleNewAddress={this.handleNewAddress}
          createEvent={this.createEvent}
          getTrip={this.getTrip}
          startDate={this.state.startDate}
          view={this.state.view}
        />);
    }
    return (
      <MapView
        timelineId={this.state.timelineId}
      />);
  }

  render() {
    const timelineView = this.renderView();

    return (
      <div className="App">
        {this.state.isLoggedIn ? (
          <div className="nav-links">
            <img src={this.state.userInfo.thumbnail} alt="user-thumbnail" />
            <Link to="/profile">{this.state.userInfo.username}</Link>
            <a href="/auth/logout">Logout</a>
          </div>
        ) : (
          <div className="nav-links">
            <a href="/auth/login">Login</a>
          </div>
        )}
        <div className="title">Whale Then..</div>
        <div className="container timelineParams">
          <TimelineInputBox onInput={this.onInputChange} onEnter={this.onEnter} />
          <StartDateBox
            onInput={this.onInputChange}
            onEnter={this.onEnter}
            today={this.state.today}
          />
          <EndDateBox
            onInput={this.onInputChange}
            onEnter={this.onEnter}
            startDate={this.state.startDate}
          />
          <button className="scheduleSubmit" onClick={() => this.onSubmit()}>New Schedule</button>
          {this.state.timelineId && <button className="scheduleSubmit" onClick={() => this.onToggleView('default')}>Day to Day</button>}
          {this.state.timelineId && <button className="scheduleSubmit" onClick={() => this.onToggleView('mapview')}>Map Trip</button>}
          {this.state.timelineId && <button className="scheduleSubmit" onClick={() => this.onToggleView('calendar')}>Calendar</button>}
        </div>
        {timelineView}
        <div>
          <TimelineLookup
            handleId={this.handleId}
            handleName={this.handleName}
            getTrip={this.getTrip}
            onLookupEnter={this.onLookupEnter}
          />
        </div>
        <Search
          numberOfDays={this.state.numberOfDays}
          addNewEvent={this.addNewEvent}
        />
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
