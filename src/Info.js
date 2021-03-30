import React, { useState, useEffect } from 'react';
import { useStoreState } from './Store';
import { FrontLink, FrontCompose } from './FrontActions';
import DataElement from './DataElement';

const Info = ({ contactKey }) => {
  const { secret, airtableKey, airtableBase } = useStoreState();

  const [isLoading, setLoadingState] = useState(true);
  const [info, setInfo] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (info.contactKey === contactKey)
      return;

    console.log('contact key here');
    console.log(contactKey);
  
    const uri = `/api/search?auth_secret=${secret}&contact_key=${encodeURIComponent(contactKey)}`;
    // For the hosted version, we pass the Airtable credentials to the server
    const withAirtableCredentials = (airtableKey && airtableBase) ? `&airtable_key=${airtableKey}&airtable_base=${airtableBase}` : '';
    const emptyInfo = {contactKey: contactKey};

    setLoadingState(true);
    setError(null);

    fetch(`${uri}${withAirtableCredentials}`, {
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
    .then(response => setInfo(Object.assign(emptyInfo, response.data)))
    .catch((err) => {
      setInfo(emptyInfo);
      setError(err.message);
    })
    .finally(() => setLoadingState(false));
  }, [info, contactKey, secret, airtableKey, airtableBase]);

  if (isLoading)
    return <div className="notice">Loading...</div>;

  if (error)
    return <div className="notice error">{error}</div>;

  if (!info || !info.contact)
    return <div className="notice">No record found.</div>;

  console.log('info is here');
  console.log(info);

  // BORROWER PROFILE
  // loan id
  // phone
  // address
  // social
  // Current status

  // LOAN TEAM
  // Loan consultant associate
  // Loan consultant

  // REQUIRED INFORMATION
  // Mortgage application
  // Credit verification
  // Income verification
  // Assets & debts
  // ID records

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
            <div className="data-title">Borrower profile</div>
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
              <div className="data-title">Loan team</div>
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