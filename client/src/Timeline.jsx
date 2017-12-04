import React from 'react';
import _ from 'lodash';
import propTypes from 'prop-types';
import DayView from './Day';
import Calendar from './Calendar';

const Timeline = (props) => {
  const {
    timelineData,
    timelineId,
    timelineName,
    onCreateEnter,
    handleNewEvent,
    handleNewAddress,
    createEvent,
    getTrip,
    user,
    startDate,
    view,
  } = props;

  const displayView = () => {
    if (props.view === 'calendar') {
      return <Calendar events={timelineData} name={timelineName} start={startDate} />;
    }
    return (
      <div className="container day">
        {_.map(timelineData, (day, i) => (
          <DayView
            timelineId={timelineId}
            day={day}
            key={i}
            onCreateEnter={onCreateEnter}
            handleNewEvent={handleNewEvent}
            handleNewAddress={handleNewAddress}
            createEvent={createEvent}
            getTrip={getTrip}
          />))}
      </div>);
  };

  const timelineView = displayView();

  return (
    <div className="container timeline">
      {timelineView}
    </div>
  );
};

Timeline.propTypes = {
  timelineData: propTypes.instanceOf(Array).isRequired,
  timelineId: propTypes.string.isRequired,
  timelineName: propTypes.string,
  startDate: propTypes.string,
  onCreateEnter: propTypes.func.isRequired,
  handleNewEvent: propTypes.func.isRequired,
  handleNewAddress: propTypes.func.isRequired,
  createEvent: propTypes.func.isRequired,
  getTrip: propTypes.func.isRequired,
  view: propTypes.string.isRequired,
};

export default Timeline;
