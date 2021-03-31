import React, { useState, useEffect } from 'react';
import { useStoreState } from './Store';
import { FrontLink, FrontCompose } from './FrontActions';
import DataElement from './DataElement';

const statuses = [
  "Pre-approval",
  "Pre-lock",
  "Application",
  "Initial Processing",
  "Conditional approval",
  "Closing",
  "Servicing"
];

const preLockTagId = "tag_12za4t";
const applicationTagId = "tag_12za6l";

const Info = ({ contactKey, applyTag, currentTags }) => {
  const { secret, airtableKey, airtableBase } = useStoreState();

  const [isLoading, setLoadingState] = useState(true);
  const [info, setInfo] = useState({});
  const [error, setError] = useState(null);

  const hasApplicationTag = currentTags.find(t => t.id === applicationTagId);

  useEffect(() => {
    if (info.contactKey === contactKey)
      return;
  
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

  
  const metadataValues = info.contact?.data.filter(e => e.type !== 'boolean');
  const booleanRecords = info.contact?.data.filter(e => e.type === 'boolean');

  const accountRecords = info.account?.data.filter(r => r.label !== 'Status');

  const currentStatus = info.account?.data.find(r => r.label === 'Status');

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
        { metadataValues ? (
          <>
            <div className="data-title">Borrower profile</div>
            <ul className="list-data">
              {metadataValues.map((e, idx) => <li key={idx}>
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
        { accountRecords ? (
            <>
              <div className="data-title">Team ownership</div>
              <ul className="list-data">
               {accountRecords.map((e, idx) => <li key={idx}>
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
        <div className="data-title">Status</div>
        <ul className="list-data">
          <select
            className="select-contact"
            value={hasApplicationTag ? 'Application' : currentStatus}
            onChange={(e) => {
              const newAccountData = info.account.data.map(r => {
                if (r.label === 'Status')
                  return {
                    ...r,
                    value: e.target.value
                  }
                
                return r;
              });

              const newInfo = {
                ...info,
                account: {
                  data: newAccountData 
                }
              };

              if (e.target.value === 'Pre-lock')
                applyTag(preLockTagId);

              console.log('new info here');
              console.log(newInfo);

              return setInfo(newInfo);
            }}
          >
            {statuses.map(c => <option key={c}>{c}</option>)}
          </select>
        </ul>
      </div>

      <div className="info-account">
          { booleanRecords ? (
          <>
            <div className="data-title">Required information</div>
            <ul className="list-data">
              {booleanRecords.map((e, idx) => <li key={idx}>
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