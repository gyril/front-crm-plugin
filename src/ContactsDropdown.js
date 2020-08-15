import React from 'react';

const ContactsDropdown = ({ contacts, currentContact, setContact }) => {
  if (!currentContact)
    return <></>;

  return (
    <div className="select-container">
      <select className="select-contact" value={currentContact} onChange={(e) => setContact(e.target.value)}>
        {contacts.map(c => <option key={c}>{c}</option>)}
      </select>
      <i className="chevron-down">⌄</i>
    </div>
  );
}

export default ContactsDropdown;