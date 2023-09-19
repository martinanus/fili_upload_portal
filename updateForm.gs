const userName                         = "Lucio Laria"
const userEmail                        = "soporte@somosfili.com, martuanus@gmail.com" // TODO - UPDATE IN PROD
//const userEmail                        = ""
const externalPortalLink               = "https://docs.google.com/forms/d/e/1FAIpQLScuTR2e9U0O1yF6Kj_CqFPAU0bkh1nLvTkYMLPjJXwzdQgKDw/viewform"

const internalEmail                    = "soporte@somosfili.com"
const filiWebSiteUrl                   = "www.somosfili.com"


const bqProjectId                       = 'fili-377220';
//const bqDataset                         = 'luciolaria'
const bqDataset                         = 'fili_sandbox'        // TODO - UPDATE IN PROD
const bqInvoicePaymentsTableName        = 'ip_01_invoices_and_payments_t'
const bqCrmTableName                    = 'i_00_counterpart_upload_ext'
const formId                            = '1L5G5VcaClixVaR3TRXWnB4ijizb5Pjqtfh-91Fqh6g8';

const transactionTypeQuestionTitle      = "¿Qué tipo de transacción querés realizar?"
const providerInvoiceQuestionTitle      = "Seleccioná el proveedor del que proviene la factura que estás cargando"
const unpaidOutcomeInvoiceQuestionTitle = "Seleccioná la factura a la que se vincula el pago";
const unpaidIncomeInvoiceQuestionTitle  = "Seleccioná la factura de un cliente a la que vincular el cobro recibido";
const projectQuestionTitle              = "Indicá el Proyecto que corresponda"
const businessUnitQuestionTitle         = "Indicá la Unidad de Negocios que corresponda"


function doGet(e) {
    updateForm();
    return HtmlService.createHtmlOutput();
}


function updateForm() {
    var form = FormApp.openById(formId);
    var questions = form.getItems();
    for (var i=0; i<questions.length; i++) {
        switch(questions[i].getTitle()){
            case unpaidIncomeInvoiceQuestionTitle:
                setUnpaidIncomeInvoicesChoices(questions[i])
                break;
            case unpaidOutcomeInvoiceQuestionTitle:
                setUnpaidOutcomeInvoicesChoices(questions[i])
                break;
            case providerInvoiceQuestionTitle:
                setProviderChoices(questions[i])
                break;
            case projectQuestionTitle:
                setProjectChoices(questions[i])
                break;
            case businessUnitQuestionTitle:
                setBusinessUnitChoices(questions[i])
                break;
        }
    }
}

/*-----------------------------------------------------------
---------------- SETTERS-------------------------------------
-----------------------------------------------------------*/
function setUnpaidIncomeInvoicesChoices(question){
    var list = question.asListItem();
    var data = getUnpaidIncomeInvoices();
    var choices = getChoicesFromList(data, list);

    list.setChoices(choices);
    Logger.log("Choices have been updated for question: %s", unpaidIncomeInvoiceQuestionTitle);
}


function setUnpaidOutcomeInvoicesChoices(question){
    var list = question.asListItem();
    var data = getUnpaidOutcomeInvoices();
    var choices = getChoicesFromList(data, list);

    list.setChoices(choices);
    Logger.log("Choices have been updated for question: %s", unpaidOutcomeInvoiceQuestionTitle);
}


function setProviderChoices(question){
    var list = question.asListItem();
    var data = getProviders();
    var choices = getChoicesFromList(data, list);

    list.setChoices(choices);
    Logger.log("Choices have been updated for question: %s", providerInvoiceQuestionTitle);
}

function setProjectChoices(question){
    var multipleChoice = question.asMultipleChoiceItem();
    var data = getProjects();
    var choices = getChoicesFromList(data, multipleChoice);

    multipleChoice.setChoices(choices);
    Logger.log("Choices have been updated for question: %s", projectQuestionTitle);
}

function setBusinessUnitChoices(question){
    var multipleChoice = question.asMultipleChoiceItem();
    var data = getBusinessUnit();
    var choices = getChoicesFromList(data, multipleChoice);

    multipleChoice.setChoices(choices);
    Logger.log("Choices have been updated for question: %s", businessUnitQuestionTitle);
}


/*-----------------------------------------------------------
---------------- GETTERS-------------------------------------
-----------------------------------------------------------*/
function getUnpaidIncomeInvoices() {
    const query = 'SELECT counterpart, currency, amount, due_date FROM '
                + '`' + bqProjectId + '.' + bqDataset + '.' + bqInvoicePaymentsTableName + '`'
                 +'WHERE (is_income is true) and (invoice_payment_relation = "invoice") '
                 + 'and (is_invoice = true) '
                 +'ORDER BY counterpart ASC';

    var rows = runQuery(query)

    var data = concatenateCols(rows)

    return data;

}


function getUnpaidOutcomeInvoices() {
    const query = 'SELECT counterpart, currency, amount, due_date FROM '
                + '`' + bqProjectId + '.' + bqDataset + '.' + bqInvoicePaymentsTableName + '`'
                + 'WHERE (is_income is false) and (invoice_payment_relation = "invoice") '
                + 'and (is_invoice = true) '
                + 'ORDER BY counterpart ASC';

    var rows = runQuery(query)

    var data = concatenateCols(rows)

    return data;
}


function getProviders() {
    const query = 'SELECT counterpart FROM '
                 + '`' + bqProjectId + '.' + bqDataset + '.' + bqCrmTableName + '`'
                 +'WHERE (relation = "Proveedor") and (upload_source = "manual")'
                 + 'ORDER BY counterpart ASC';

    var rows = runQuery(query)

    var data = rowsToList(rows, "No hay Proveedores cargados")

    return data;
}

function getProjects() {
    // const query = 'SELECT counterpart FROM '
    //              + '`' + bqProjectId + '.' + bqDataset + '.' + bqCrmTableName + '`'
    //              +'WHERE (relation = "Proveedor") and (upload_source = "manual")'
    //              + 'ORDER BY counterpart ASC';

    // var rows = runQuery(query)

    // var data = rowsToList(rows, "No hay Proveedores cargados")
    data = ["unProyecto", "otroProyecto"]

    return data;
}

function getBusinessUnit() {
    // const query = 'SELECT counterpart FROM '
    //              + '`' + bqProjectId + '.' + bqDataset + '.' + bqCrmTableName + '`'
    //              +'WHERE (relation = "Proveedor") and (upload_source = "manual")'
    //              + 'ORDER BY counterpart ASC';

    // var rows = runQuery(query)

    // var data = rowsToList(rows, "No hay Proveedores cargados")
    data = ["unaBU", "otraBU"]

    return data;
}