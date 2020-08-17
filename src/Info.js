import React, { useState, useEffect } from 'react';
import { useStoreState } from './Store';
import { FrontLink, FrontCompose } from './FrontActions';
import DataElement from './DataElement';
import { API_ENDPOINT } from './Config';

const Info = ({ contactKey }) => {
  const { secret } = useStoreState();

  const [isLoading, setLoadingState] = useState(true);
  const [info, setInfo] = useState({});

  useEffect(() => {
    if (info.contactKey === contactKey)
      return;
  
    const uri = `${API_ENDPOINT}?auth_secret=${secret}&contact_key=${encodeURIComponent(contactKey)}`;
    const emptyInfo = {contactKey: contactKey};

    setLoadingState(true);

    fetch(`${uri}`, {
      method: 'GET',
      mode: 'cors'
    })
    .then(r => r.json())
    .then(response => setInfo(Object.assign(emptyInfo, response.data)))
    .catch(() => setInfo(emptyInfo))
    .finally(() => setLoadingState(false));
  }, [info, contactKey, secret]);

  if (isLoading)
    return <div className="notice">Loading...</div>;

  if (!info || !info.contact)
    return <div className="notice">No record found.</div>;

  return (
    <div className="info">
      <div className="info-card">
        <div className="info-card-contact">{info.contact?.name}</div>
        <div><FrontCompose to={info.contact?.email} label={info.contact?.email} /></div>
        { info.account ? (
          <div className="info-card-account"><FrontLink href={info.account.url} label={info.account.name} /></div>
        ) : undefined }
      </div>
      <div className="info-contact">
        { info.contact?.data ? (
          <>
            <div className="data-title">Contact info</div>
            <ul className="list-data">
              {info.contact.data.map((e, idx) => <li key={idx}>
                <div className="info-entry">
                  <div className="info-label">{e.label}</div>
                  <div className="info-value"><DataElement type={e.type} value={e.value} /></div>
                </div>
              </li>)}
            </ul>
          </>
        ) : undefined }
      </div>
      <div className="info-account">
        { info.account?.data ? (
            <>
              <div className="data-title">Account info</div>
              <ul className="list-data">
               {info.account.data.map((e, idx) => <li key={idx}>
                  <div className="info-entry">
                    <div className="info-label">{e.label}</div>
                    <div className="info-value"><DataElement type={e.type} value={e.value} /></div>
                  </div>
                </li>)}
              </ul>
            </>
          ) : undefined }
      </div>
    </div>
  );
};

export default Info;