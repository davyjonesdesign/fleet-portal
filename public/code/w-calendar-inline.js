import React from 'react';
import { MultiViewCalendar } from '@progress/kendo-react-dateinputs';



const CalendarInline = () => {
  return (
    <MultiViewCalendar className='w-calendar-inline' views={1} />
  );
};

export default CalendarInline;
