async function handleEnquiryRequest() {
    try {
        if (m.securelogin == "YES") {
            if (m.securelogintoken == "") {
              return {
                    return: JSON.stringify({
                        "WSCode": "20",
                        "WSStatus": "FAILED",
                        "WSMessage": "NO LOGIN TOKEN PROVIDED FOR SECURE LOGIN",
                        "Data": ""
                    })
                };
            } else {
                const secureLoginResult = await selectSecureLoginToken(m.securelogintoken);

                if (secureLoginResult.length === 1) {
                    const teller = await decryptTellerData(secureLoginResult[0]);
                    m.tuser = teller.tuser;
                    m.tpass = teller.tpass;
                    enquiryRequest.userInformation = m;

                    const enquiryResult = await makeEnquiryRequest(enquiryRequest);

                    const enq = JSON.parse(enquiryResult.return);
                    console.log("ENQ RESPONSE\n\n" + JSON.stringify(enq));

                    const { norecord, norecordvalue } = checkNoRecords(enq.Data);

                    if (norecord == 1) {
                        enq.WSCode = "20";
                        enq.WSStatus = "FAILED";
                        enq.WSMessage = norecordvalue;
                        enq.Data = null;

                        await Promise.all([
                            updateAgentActivity(enq, m.tki),
                            updateAgentActivityStatus(m.tki)
                        ]);

                        return {
                            return: JSON.stringify(enq)
                        };
                    } else {
                        return enquiryResult;
                    }
                } else {
                    var dt = dateTime.create();
                    var dtcom = dt.format('Y-m-d H:M:S');
                    //connection.query("UPDATE connectiontokens SET  status = ?, destroyedon= ? WHERE token = ?", ['CLOSED', dtcom, m.tki], function (err, rows, fields) {});
                    return {
                        return: JSON.stringify({
                            "WSCode": "20",
                            "WSStatus": "FAILED",
                            "WSMessage": "INVALID TELLER TOKEN OR TELLER TOKEN HAS EXPIRED",
                            "Data": ""
                        })
                    };
                }
            }
        } else {
            const enquiryResult = await makeEnquiryRequest(enquiryRequest);

            const enq = JSON.parse(enquiryResult.return);
            console.log("ENQ RESPONSE\n\n" + JSON.stringify(enq));

            const { norecord, norecordvalue } = checkNoRecords(enq.Data);

            if (norecord == 1) {
                enq.WSCode = "20";
                enq.WSStatus = "FAILED";
                enq.WSMessage = norecordvalue;
                enq.Data = null;

                await Promise.all([
                    updateAgentActivity(enq, m.tki),
                    updateAgentActivityStatus(m.tki)
                ]);

                return {
                    return: JSON.stringify(enq)
                };
            } else {
                return enquiryResult;
            }
        }
    } catch (error) {
        return {
            return: JSON.stringify({
                "WSCode": "20",
                "WSStatus": "FAILED",
                "WSMessage": "An error occurred",
                "Data": error.message
            })
        };
    }
}

async function selectSecureLoginToken(token) {
    // Implement your select query here and return the result.
}

async function decryptTellerData(data) {
    // Implement your decryption logic here and return the result.
}

async function makeEnquiryRequest(request) {
    // Implement your API request logic here and return the result.
}

function checkNoRecords(data) {
    // Implement your logic to check for "No records were found" and return result.
    return { norecord, norecordvalue };
}

async function updateAgentActivity(data, token) {
    // Implement your update query for agent activity here.
}

async function updateAgentActivityStatus(token) {
    // Implement your update query to set the status here.
}

// Usage
handleEnquiryRequest()
    .then(response => {
        response.send(response);
    })
    .catch(error => {
        response.send(error);
    });
