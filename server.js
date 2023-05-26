const express = require('express');
const bodyParser = require('body-parser');
const { URLSearchParams } = require('url');
const fetch = require('node-fetch');

const app = express();

const SITE_KEY = "chk_000000000000000000000000"; // Modify this.
const SECRET_KEY = "chk_secret_000000000000000000000000000000000000000000000000"; // Modify this.

const port = process.env.PORT || 3000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'ejs');
app.use('/assets', express.static(__dirname + '/public/assets'));

app.get('/', (req, res) => {
    res.render('index', {
        site_key: SITE_KEY,
        error: null,
        success: false,
    });
})

app.post('/login', (req, res) => {
    let email = req.body.email;
    let token = req.body['v4g-checkpoint-response'];

    const body = new URLSearchParams();
    body.set('secret', SECRET_KEY);
    body.set('token', token);

    let url = 'https://challenges.v4guard.io/checkpoint/v1/tokenverify';

    let options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
    };

    fetch(url, options)
        .then(res => res.json())
        .then(json => {

            if (!json.success) {
                return res.render('index', {
                    site_key: SITE_KEY,
                    error: `An error occured: ${json.errors[0]}`,
                    success: null
                });
            }

            if (json.response.blocked) {
                return res.render('index', {
                    site_key: SITE_KEY,
                    error: `Disable your VPN/proxy!`,
                    success: null
                });
            }

            return res.render('index', {
                site_key: SITE_KEY,
                error: null,
                success: `Welcome ${email}!`
            });
        })
        .catch(err => {
            return res.render('index', {
                site_key: SITE_KEY,
                error: `An error occured: ${err}`,
                success: null
            });
        });
});

let server = app.listen(port, () => {
    let host = server.address().address == '::' ? 'localhost' : server.address().address
    let port = server.address().port

    console.log(``);
    console.log(`\t\x1B[38;2;127;39;199m\x1B[1mv4Guard Checkpoint\x1B[22m - demonstration`);
    console.log(`\t\x1b[38;2;203;11;160m➜ Listening on \x1b]8;;http://${host}:${port}\u0007http://${host}:${port}\x1b]8;;\u0007\x1b[39m`);
    console.log(``);
});
