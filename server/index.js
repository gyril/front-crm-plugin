const AUTH_SECRET = process.env.AUTH_SECRET;

const driver = require(`./drivers/${process.env.DRIVER}`);
const express = require('express');
const app = express();
const port = process.env.SERVER_PORT || 9070;

// Utility function so that a Promise returns an Array of [err, result]
const to = promise => promise.then(data => {
  return [null, data];
}).catch(err => [err]);

// Logging
app.use(require('express-pino-logger')());

// Static routes
app.use(express.static(`${__dirname}/build/`));

// This is the endpoint that Front will call upon selection of a conversation
app.get('/api/search', async (req, res) => {
  // Deny requests that do not come from Front
  if (AUTH_SECRET !== '' && req.query.auth_secret !== AUTH_SECRET)
    return res.sendStatus(401);

  // Deny requests that are malformed
  if (!req.query.contact_key)
    return res.sendStatus(404);

  const contactKey = req.query.contact_key;

  // For the hosted version, we allow the client to pass credentials for Airtable
  const airtableKey = req.query.airtable_key;
  const airtableBase = req.query.airtable_base;
  const [err, contactData] = (process.env.DRIVER === 'airtable' && airtableKey && airtableBase)
    ? await to(driver.getDataForContact(contactKey, airtableKey, airtableBase))
    : await to(driver.getDataForContact(contactKey));

  if (err) {
    req.log.error(err);

    if (err.statusCode && err.message)
      return res.status(err.statusCode).send(err.message);

    return res.status(500).send(err);
  }

  if (!contactData)
    return res.sendStatus(404);

  res.send({data: contactData});
});

app.listen(port, () => console.log(`Server listening on port ${port}`));