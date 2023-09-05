const userName                         = "Iberogram"
const userEmail                        = "soporte@somosfili.com"
const internalEmail                    = "soporte@somosfili.com"
const filiWebSiteUrl                   = "www.somosfili.com"


const bqProjectId                       = 'fili-377220';
const bqDataset                         = 'iberogram'
const bqInvoicePaymentsTableName        = 'ip_01_invoices_and_payments_t'
const bqCrmTableName                    = 'i_00_counterpart_upload_ext'
const formId                            = '19jt0Qa0s1vgk5byFLvaDFVfuMbmrAsdpsXxAH2jrtS0';

const unpaidIncomeInvoiceQuestionTitle  = "Seleccioná la factura de un cliente a la que vincular el cobro recibido";
const unpaidOutcomeInvoiceQuestionTitle = "Seleccioná la factura a la que se vincula el pago";
const uninvoicedOutcomePaymentQuestionTitle = "Seleccioná el pago al que se vincula la nueva factura cargada";
const projectQuestionTitle              = "Marcá el Centro de Coste (CC) correspondiente";
const clientsToSendQuestionTitle        = "Seleccioná el cliente del que proviene la factura que estás cargando";
const salariesQuestionTitle             = "Seleccione los sueldos/honorarios que quiere marcar como pagos";
const taxesQuestionTitle                = "Seleccioná el impuesto que pagaste";


const transactionTypeQuestionTitle      = "¿Qué tipo de transacción querés realizar?"
const sendInvoiceChoice                 = 'Envío de factura a clientes'
const invoiceAttachQuestionTitle        = 'ENVÍO FACTURA - Adjuntá la factura a enviar'
const clientSelectionQuestionTitle      = 'Seleccioná el cliente al que enviarle la factura'
const customMailContentQuestionTitle    = ("En caso de querer modificar el contenido del mail que se enviará a tu cliente, "
                                        + "escribí acá el nuevo texto a incluir. \nEl mensaje por defecto, si se deja vacía esta "
                                        + "respuesta, se muestra acá.")



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
            case uninvoicedOutcomePaymentQuestionTitle:
                setUninvoicedOutcomePaymentChoices(questions[i])
                break;
            case projectQuestionTitle:
                setProjectQuestionTitleChoices(questions[i])
                break;
            case clientsToSendQuestionTitle:
                setClientsChoices(questions[i], clientsToSendQuestionTitle)
                break;
            case clientSelectionQuestionTitle:
                setClientsChoices(questions[i], clientSelectionQuestionTitle)
                break;
            case salariesQuestionTitle:
                setSalariesChoices(questions[i])
                break;
            case taxesQuestionTitle:
                setTaxesChoices(questions[i])
                break;
        }
    }
}

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

function setUninvoicedOutcomePaymentChoices(question){
    var list = question.asListItem();
    var data = getUninvoicedOutcomePayments();
    var choices = getChoicesFromList(data, list);

    list.setChoices(choices);
    Logger.log("Choices have been updated for question: %s", uninvoicedOutcomePaymentQuestionTitle);
}

function setProjectQuestionTitleChoices(question){
    var multipleChoice = question.asMultipleChoiceItem();
    var data = getProjects();
    var choices = getChoicesFromList(data, multipleChoice);

    multipleChoice.setChoices(choices);
    multipleChoice.showOtherOption(true);
    Logger.log("Choices have been updated item question: %s", projectQuestionTitle);
}


function setClientsChoices(question, qTitle){
    var list = question.asListItem();
    var data = getClients();
    var choices = getChoicesFromList(data, list);

    list.setChoices(choices);
    Logger.log("Choices have been updated for question: %s", qTitle);
}

function setSalariesChoices(question){
    var checkbox = question.asCheckboxItem();
    var data = getSalaries();
    var choices = getChoicesFromList(data, checkbox);

    checkbox.setChoices(choices);
    Logger.log("Choices have been updated for question: %s", salariesQuestionTitle);
}


function setTaxesChoices(question){
    var list = question.asListItem();
    var data = getPendingTaxes();
    var choices = getChoicesFromList(data, list);

    list.setChoices(choices);
    Logger.log("Choices have been updated for question: %s", uninvoicedOutcomePaymentQuestionTitle);
}




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
                + 'and ( (invoice_group_1 != "Honorarios") and (invoice_group_1 != "Impuestos") '
                + 'or (invoice_group_1 is null) )'
                + 'ORDER BY counterpart ASC';

    var rows = runQuery(query)

    var data = concatenateCols(rows)

    return data;
}


function getUninvoicedOutcomePayments() {
    const query = 'SELECT payment_counterpart, payment_currency, payment_amount, payment_date FROM '
                 + '`' + bqProjectId + '.' + bqDataset + '.' + bqInvoicePaymentsTableName + '`'
                 + 'WHERE (is_income is false) and (invoice_payment_relation = "payment") '
                 + 'and (is_invoice = true) '
                 + 'ORDER BY payment_counterpart ASC';

    var rows = runQuery(query)

    var data = concatenateCols(rows)

    return data;
}

function getProjects() {
    const query = 'SELECT invoice_group_3 FROM '
                 + '`' + bqProjectId + '.' + bqDataset + '.' + bqInvoicePaymentsTableName + '`'
                 +'WHERE invoice_group_3 is not null '
                 +'GROUP BY invoice_group_3';

    var rows = runQuery(query)

    var data = rowsToList(rows, "No hay Centros de Coste (CC) cargados")

    return data;
}

function getClients() {
    const query = 'SELECT counterpart FROM '
                 + '`' + bqProjectId + '.' + bqDataset + '.' + bqCrmTableName + '`'
                 +'WHERE (relation = "Cliente") and (upload_source = "manual")'
                 + 'ORDER BY counterpart ASC';

    var rows = runQuery(query)

    var data = rowsToList(rows, "No hay Clientes cargados")

    return data;
}


function getSalaries() {
    const query = 'SELECT counterpart, invoice_group_1, invoice_group_2, currency, amount FROM '
                 + '`' + bqProjectId + '.' + bqDataset + '.' + bqInvoicePaymentsTableName + '`'
                 +'WHERE (invoice_group_1 = "Honorarios") and (invoice_payment_relation = "invoice")'
                 + 'ORDER BY counterpart ASC';

    var rows = runQuery(query)

    var data = concatenateCols(rows)

    return data;
}

function getPendingTaxes() {
    const query = 'SELECT counterpart, invoice_group_1, invoice_group_2, currency, amount FROM '
                 + '`' + bqProjectId + '.' + bqDataset + '.' + bqInvoicePaymentsTableName + '`'
                 +'WHERE (invoice_group_1 = "Impuestos") and (invoice_payment_relation = "invoice") '
                 + 'ORDER BY counterpart ASC';

    var rows = runQuery(query)

    var data = concatenateCols(rows)

    return data;
}



