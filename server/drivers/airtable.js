const Airtable = require('airtable');

// Edit this object to add or remove attributes displayed
const fields = {
  contact: [
    {label: 'Title', type: 'string'},
    {label: 'Role', type: 'list'},
    {label: 'Phone', type: 'phone'}
  ],
  account: [
    {label: 'Industry', type: 'string'},
    {label: 'Contract Value', type: 'currency'},
    {label: 'Renewal', type: 'date'},
    {label: 'Segment', type: 'badge'}
  ]
};

const getDataForContact = async (contactKey, airtableKey, airtableBase) => {

  Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: airtableKey || process.env.AIRTABLE_KEY
  });

  const base = Airtable.base(airtableBase || process.env.AIRTABLE_BASE);

  // From the "Contacts" base, find the record associated with this contact key
  return base('Contacts')
    .select({
      maxRecords: 1,
      filterByFormula: `Email="${contactKey}"`
    })
    .firstPage()
    .then((records) => {
      // Contact not found
      if (records.length === 0)
        return null;

      const contactFields = records[0].fields;

      // List of fields we want to associate as Contact data
      const contactFieldList = fields['contact'];

      const data = {
        contact: {
          name: contactFields['Full Name'],
          email: contactFields['Email'],
          data: contactFieldList
            .map(f => ({type: f.type, label: f.label, value: contactFields[f.label]}))
            .filter(f => typeof f.value !== 'undefined')
        }
      };

      // If there's no Company data, return Contact data only
      if (!contactFields['Company'] || contactFields['Company'].length === 0)
        return data;

      const accountId = contactFields['Company'][0];
      
      // From the "Companies" base, find the record associated with this accountId
      return base('Companies')
        .find(accountId)
        .then((record) => {
          const accountFields = record.fields;

          // List of fields we want to associate as Account data
          const accountFieldList = fields['account'];

          data.account = {
            name: accountFields['Company'],
            url: accountFields['Website'],
            data: accountFieldList
              .map(f => ({type: f.type, label: f.label, value: accountFields[f.label]}))
              .filter(f => typeof f.value !== 'undefined')
          };

          // Return Contact and Account data
          return data;
        })
        .catch(err => { throw err; });
    })
    .catch(err => { throw err; });
};

module.exports = {
  getDataForContact: getDataForContact
};