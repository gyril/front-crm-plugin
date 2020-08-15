import React from 'react';
import { DateTime } from 'luxon';

const Date = ({ value }) => { 
  const parsedDate = DateTime.fromISO(value);

  if (parsedDate.invalid)
    return <em>Not found.</em>;
  
  return parsedDate.toFormat('D');
};

const Currency = ({ value }) => {
  const amount = Number(value); 
  const amountString = amount < 1000 ?
    amount.toFixed(0) :
    amount < 1000000 ?
      `${Math.round(amount / 10) / 100}k` :
      `${Math.round(amount / 10000) / 100}m`;
  return <span>${amountString}</span>;
};

const Badge = ({ value }) => <span className="data-badge">{value}</span>;

const DataElement = ({ type, value }) => {
  if (type === 'date')
    return <Date value={value} />

  if (type === 'badge')
    return <Badge value={value} />
  
  if (type === 'currency')
    return <Currency value={value} />

  return <>{value}</>;
};

export default DataElement;