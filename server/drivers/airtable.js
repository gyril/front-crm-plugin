const Airtable = require('airtable');

// Edit this object to add or remove attributes displayed
const fields = {
  contact: [
    {label: 'Phone', type: 'phone'},
    {label: 'Loan ID', type: 'string'},
    {label: 'Address', type: 'string'},
    {label: 'Social security', type: 'string'},
    {label: 'Mortgage application', type: 'boolean'},
    {label: 'Credit verification', type: 'boolean'},
    {label: 'Income verification', type: 'boolean'},
    {label: 'Assets & debt', type: 'boolean'},
    {label: 'ID records', type: 'boolean'},
  ],
  account: [
    {label: 'Loan consultant associate', type: 'string'},
    {label: 'Loan consultant', type: 'currency'}
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

      console.log('data is really here');
      console.log(contactFields);
      const data = {
        contact: {
          name: contactFields['Full Name'],
          email: contactFields['Email'],
          data: contactFieldList
            .map(f => ({type: f.type, label: f.label, value: contactFields[f.label]}))
        }
      };

      // If there's no  Loan data, return Contact data only
      if (!contactFields['Loan'] || contactFields['Loan'].length === 0)
        return data;

      const loanId = contactFields['Loan'][0];
      
      // From the "Loans" base, find the record associated with this loanId
      return base('Loans')
        .find(loanId)
        .then((record) => {
          console.log('loan record is here');
          console.log(record);
          const accountFields = record.fields;

          // List of fields we want to associate as Account data
          const accountFieldList = fields['account'];

          data.account = {
            name: accountFields['Loan'],
            url: accountFields['Website'],
            data: accountFieldList
              .map(f => ({type: f.type, label: f.label, value: accountFields[f.label]}))
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