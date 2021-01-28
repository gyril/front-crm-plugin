import React, { useState, useEffect } from 'react';
import { useStoreState } from './Store';
import DataElement from './DataElement';

const Info = ({ contactKey }) => {
  const { secret } = useStoreState();

  const [isLoading, setLoadingState] = useState(true);
  const [info, setInfo] = useState({});
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);

  const changeIndex = (change, length) => {
    let newIndex = index + change;
    if (newIndex === -1)
      newIndex = length - 1;

    if (newIndex === length)
      newIndex = 0;

    return setIndex(newIndex);
  };

  useEffect(() => {
    if (info.contactKey === contactKey)
      return;
  
    const uri = `/api/search?auth_secret=${secret}&contact_key=${encodeURIComponent(contactKey)}`;
    const emptyInfo = {contactKey: contactKey};

    setLoadingState(true);
    setError(null);
    setIndex(0);

    fetch(`${uri}`, {
      method: 'GET',
      mode: 'cors'
    })
    .then(r => {
      if (!r.ok && r.status !== 404)
        throw Error(r.statusText);

      if(r.status === 404)
        return ({});

      return r.json();
    })
    .then(response => setInfo(Object.assign(emptyInfo, {data: response.data})))
    .catch((err) => {
      setInfo(emptyInfo);
      setError(err.message);
    })
    .finally(() => setLoadingState(false));
  }, [info, contactKey, secret]);

  if (isLoading)
    return <div className="notice">Loading...</div>;

  if (error)
    return <div className="notice error">{error}</div>;

  if (!info || !info.data)
    return <div className="notice">No record found.</div>;

  return (
    <div className="info">
      <div className="info-contact">
        <ul className="list-data">
          <div className="index-picker">
            <span className="index-picker-button" onClick={() => changeIndex(-1, info.data.length)}>&lt;&lt;</span>
            <span> {index + 1} / {info.data.length} </span>
            <span className="index-picker-button" onClick={() => changeIndex(1, info.data.length)}>&gt;&gt;</span>
          </div>
          {Object.entries(info.data[index]).map((e, idx) => <li key={idx}>
            <div className="info-entry">
              <div className="info-label">{e[0]}</div>
              <div className="info-value"><DataElement value={e[1]} /></div>
            </div>
          </li>)}
        </ul>
      </div>
    </div>
  );
};

export default Info;