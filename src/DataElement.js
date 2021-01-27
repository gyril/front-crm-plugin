import React from 'react';
import { DateTime } from 'luxon';

const DateElement = ({ value }) => { 
  const parsedDate = DateTime.fromISO(value);

  if (parsedDate.invalid)
    return <em>Invalid date</em>;
  
  return parsedDate.toFormat('D');
};

const DataElement = ({ value }) => {
  if (new Date(value).toString() !== 'Invalid Date' && new Date(value).toISOString() === value)
    return <DateElement value={value} />;

  if (Array.isArray(value) && !value.find(e => !!e))
    return <>N/A</>;

  if (Array.isArray(value))
    return <>{value.join(', ')}</>;
  
  return <>{value || 'N/A'}</>;
};

export default DataElement;