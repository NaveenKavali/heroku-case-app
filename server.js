var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();

app.set('port', process.env.PORT || 5000);

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/update', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
        conn.query(
            'UPDATE salesforce.Case SET batch_number__c = $1 WHERE LOWER(initial_patient_name__c) = LOWER($2) AND LOWER(initial_patient_surname__c) = LOWER($3) AND LOWER(age__c) = LOWER($4)',
            [req.body.batch_number__c.trim(), req.body.initial_patient_name__c.trim(), req.body.initial_patient_surname__c.trim(), req.body.age__c.trim()],
            function(err, result) {
                if (err != null || result.rowCount == 0) {
                  conn.query('INSERT INTO salesforce.Case (batch_number__c, initial_patient_name__c, initial_patient_surname__c, age__c) VALUES ($1, $2, $3, $4, $5)',
                  [req.body.batch_number__c.trim(), req.body.batch_number__c.trim(), req.body.initial_patient_name__c.trim(), req.body.initial_patient_surname__c.trim(), req.body.age__c.trim()],
                  function(err, result) {
                    done();
                    if (err) {
                        res.status(400).json({error: err.message});
                    }
                    else {
                        // this will still cause jquery to display 'Record updated!'
                        // eventhough it was inserted
                        res.json(result);
                    }
                  });
                }
                else {
                    done();
                    res.json(result);
                }
            }
        );
    });
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
