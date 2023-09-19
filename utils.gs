function rowsToList(rows, noDataMsg){
    if (!rows) {
        var dataNoOption = [noDataMsg]
        return dataNoOption;
    }

    var data = new Array(rows.length);

    for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].f;
        for (let j = 0; j < cols.length; j++) {
            data[i] = cols[j].v;
        }
    }

    data = [... new Set(data)] // remove duplicated options

    return data;
}


function getChoicesFromList(data, item){
    var choices = [];
    for (var j=0; j<data.length; j++) {
        choices.push(item.createChoice(data[j]));
    }

    return choices
}

function concatenateCols(rows){

    if (!rows) {
        var dataNoOption = ["No hay pendientes para seleccionar"]
        return dataNoOption;
    }

    var data = new Array(rows.length);
    const separator = " - ";

    for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].f;
        let strOption = "";
        for (let j = 0; j < cols.length; j++) {
            if (cols[j].v){
                if (isDate(cols[j].v)){
                    cols[j].v = formatDate(cols[j].v)
                } else if (Number(cols[j].v)){
                    cols[j].v = formatAmount(cols[j].v);
                }
                strOption += cols[j].v;
                strOption += separator;
            }
        }
        strOption = strOption.substring(0, strOption.length - separator.length);

        strOption = strOption.replace("euro_official -", "EU")
        strOption = strOption.replace("dollar_official -", "USD")
        strOption = strOption.replace("peso -", "$")

        data[i] = strOption;
    }
    data = [... new Set(data)] // remove duplicated options

    return data;
}

function runQuery(query){

    const request = {
        query: query,
        useLegacySql: false
    };
    let queryResults = BigQuery.Jobs.query(request, bqProjectId);
    const jobId = queryResults.jobReference.jobId;


    // Check on status of the Query Job.
    let sleepTimeMs = 500;
    while (!queryResults.jobComplete) {
        Utilities.sleep(sleepTimeMs);
        sleepTimeMs *= 2;
        queryResults = BigQuery.Jobs.getQueryResults(bqProjectId, jobId);
    }

    // Get all the rows of results.
    let rows = queryResults.rows;
    while (queryResults.pageToken) {
        queryResults = BigQuery.Jobs.getQueryResults(bqProjectId, jobId, {
            pageToken: queryResults.pageToken
        });
        rows = rows.concat(queryResults.rows);
    }

    if (!rows) {
        console.log('No rows returned on query: \n' + query);
        return;
    }

    return rows;

}

function formatAmount(str) {
    var num = Number(str).toFixed(2).replace(".", ",");
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function isDate(str) {
    if(((str.split("-").length - 1) == 2) && (str.length == 10))
        var month = Number(str.split("-")[1]);
        var day = Number(str.split("-")[2]);
        if ((month<=12) && (day<=31)){
            return true;
        }
    return false;
}

function formatDate(str) {
    var year = str.split("-")[0];
    var month = str.split("-")[1];
    var day = str.split("-")[2];
    return (day+"/"+month+"/"+year)
}

function getFiliUrlWithUtm(client, language){
    var userHashed = hash_str(bqDataset)
    var clientHashed = hash_str(client)

    var UrlWithUtm = filiWebSiteUrl+"?utm_source=fact&utm_medium=mail&utm_campaign="+userHashed
    UrlWithUtm += "&utm_content="+clientHashed

    var enFili = "Sent with Fili";
    var frFili = "Envoyé avec Fili";
    var esFili = "Enviado con Fili";

    var langMsg;
    switch (language) {
        case 'Inglés':
            langMsg = enFili
        case 'Francés':
            langMsg = frFili
        case 'Español':
            langMsg = esFili
    }

    console.log("UrlWithUtm: " + UrlWithUtm);

    var htmlText = `<BR><a href=${UrlWithUtm}><font size="-2">${langMsg}</font></a>`

    return htmlText
}

function hash_str(str_to_hash){
    let sum = 0;

    for (let i = 0; i < str_to_hash.length; i++) {
      sum += str_to_hash.charCodeAt(i);
    }
    sum *= str_to_hash.charCodeAt(0);

    return sum;
  }

function makeFilesCopy(fileIds, destination){
    for (var i = 0; i < fileIds.length; i++) {
        copyFileToFolder(fileIds[i], destination);
    }
}

function copyFileToFolder(fileId, folderId){
    const file = DriveApp.getFileById(fileId);
    const destination = DriveApp.getFolderById(folderId);
    const copiedFile = file.makeCopy(destination);
    console.log("File: " + copiedFile.getName() + " copied to: " + destination.getName());
}

function getCounterpartEmail(counterpartName){
    const query = 'SELECT contact_email FROM '
                + '`' + bqProjectId + '.' + bqDataset + '.' + bqCrmTableName + '`'
                 +'WHERE counterpart = "' + counterpartName + '"';


    var rows = runQuery(query)

    var data = rowsToList(rows, "No se encontró la contraparte en el CRM")

    var countepartEmail = data[0];

    Logger.log("countepartEmail is: " + countepartEmail)

    return countepartEmail
}


function getCounterpartLanguage(counterpartName){
    const query = 'SELECT language FROM '
                + '`' + bqProjectId + '.' + bqDataset + '.' + bqCrmTableName + '`'
                 +'WHERE counterpart = "' + counterpartName + '"';


    var rows = runQuery(query)

    var data = rowsToList(rows, "Inglés")

    var language = data[0];

    if(!language){
        language = "Inglés"
    }

    Logger.log("Language is: " + language)

    return language
}

function getAttachmentsFromFileIds(fileIds){
    blobList = [];
    for (var i = 0; i < fileIds.length; i++) {
        let file = DriveApp.getFileById(fileIds[i]);
        blobList.push(file.getBlob());
    }
    return blobList;
}


function getExternalPortalInformation(language){

    var esExternalPortalInformation = "Le pedimos por favor que, en el futuro, cargue las facturas "
                        + "en nuestro Portal de Carga que puede acceder "
                        + `<a href=${externalPortalLink}>clickeando aquí</a>. <BR><BR>`

    var enExternalPortalInformation = "For future invoices, please submit your invoices "
                        + "in our Invoice Loading Portal you can access "
                        + `<a href=${externalPortalLink}>clicking here</a>. <BR><BR>`

    var frExternalPortalInformation = "Pour des futures factures, veuillez soummetre "
                        + "vos factures dans notre portail de téléchargement en "
                        + `<a href=${externalPortalLink}>cliquant ici</a>. <BR><BR>`


    switch (language) {
        case 'Inglés':
            return enExternalPortalInformation
        case 'Francés':
            return frExternalPortalInformation
        case 'Español':
            return esExternalPortalInformation
    }
}


function getEmailBody(customMailContent, counterpartName, language){


    let emoji_html = "&#128075;"
    let enDefaultBody = `Hello ${emoji_html}, <BR><BR>`
            + `Attached you will find the proof of the payment executed  `
            + `by ` + userName + `. <BR><BR>`
            + getExternalPortalInformation(language)
            + `Thank you and have a nice day! <BR><BR>`
            + `${userName}.`;

    let frDefaultBody = `Bonjour ${emoji_html}, <BR><BR>`
            + `Vous trouverez ci-joint la preuve du paiement réalisée `
            + `par ` + userName + `. <BR><BR>`
            + getExternalPortalInformation(language)
            + `Merci beaucoup et bonne journée! <BR><BR>`
            + `${userName}.`;

    let esDefaultBody = `Hola ${emoji_html}, <BR><BR>`
            + `Le enviamos `
            + `el comprobante de pago generado `
            + `por ` + userName + `. <BR><BR>`
            + getExternalPortalInformation(language)
            + `¡Muchas gracias! <BR><BR>`
            + `El equipo de ${userName}.`;

    if (customMailContent){
        customMailContent += getFiliUrlWithUtm(counterpartName, language);
        return customMailContent.replaceAll("\n", "<BR>");
    }

    let filiUrlWithUtm = getFiliUrlWithUtm(counterpartName, language);

    switch (language) {
        case 'Inglés':
            return enDefaultBody + filiUrlWithUtm
        case 'Francés':
            return frDefaultBody + filiUrlWithUtm
        case 'Español':
            return esDefaultBody + filiUrlWithUtm
    }

}

function getSubject(userName, selectedCounterpart, language){

    var enProviderSubject   = `Proof of payment ` + userName + ` - ` + selectedCounterpart;
    var frProviderSubject   = `Preuve de paiement ` + userName + ` - ` + selectedCounterpart;
    var esProviderSubject   = `Comprobante de pago ` + userName + ` - ` + selectedCounterpart;

    switch (language) {
        case 'Inglés':
            return enProviderSubject
        case 'Francés':
            return frProviderSubject
        case 'Español':
            return esProviderSubject
    }
}


function sendEmailToCounterpart(selectedCounterpart, language, invoicesId, customMailContent){

    var subject         = getSubject(userName, selectedCounterpart, language)
    var body            = getEmailBody(customMailContent, selectedCounterpart, language);
    var countepartEmail = getCounterpartEmail(selectedCounterpart);
    var attachment      = getAttachmentsFromFileIds(invoicesId);

    GmailApp.sendEmail(countepartEmail, subject, '', {
      cc          : userEmail,
      bcc         : internalEmail,
      htmlBody    : body,
      attachments : attachment,
    })

    Logger.log("Se notificó al " + selectedCounterpart);

}

function getProviderFromInvoice(invoice){
    return invoice.split(" - ")[0]
}
