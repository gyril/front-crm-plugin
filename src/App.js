import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useStoreState } from './Store';
import Info from './Info';
import ContactsDropdown from './ContactsDropdown';

const Application = () => {
  const [contacts, setContacts] = useState([]);
  const { frontContext } = useStoreState();
  const { type, conversation } = frontContext;
  const [currentContact, setCurrentContact] = useState(null);

  useEffect(() => {
    if (!frontContext.listMessages)
      return undefined;

    frontContext.listMessages().then(r => {
      const allMessagesContacts = r.results
        .map(m => [...(m.to.map(t => t.handle)), m.from?.handle, ...(m.cc?.map(c => c.handle) || []), ...(m.bcc?.map(b => b.handle) || [])])
        .flat()
        .filter((value, index, self) => self.indexOf(value) === index);
      
      setCurrentContact(conversation?.recipient?.handle);
      setContacts(allMessagesContacts);
    });
  }, [frontContext, conversation]);

  return <div className="app">
    <Router basename={process.env.PUBLIC_URL}>
      <Switch>
        <Route path="/">
          { (type === 'singleConversation' && currentContact) ? (
            <>
              <ContactsDropdown contacts={contacts} currentContact={currentContact} setContact={setCurrentContact} />
              <Info contactKey={currentContact} />
            </>
          ) : <div className="notice">This plugin only works with conversations.</div> }
        </Route>
      </Switch>
    </Router>
  </div>;
};

export default Application;